const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");


const User = require("../Models/User");
const Reservation = require("../Models/Reservation");


router.get("/auth/signup", (req,res,next) => {
	let token = req.cookies["token"];
	try{
		const decoded = jwt.verify(token, "key");
		res.redirect("/");
	}
	catch(err){
		res.render('signup',{message:" "});
	}
});

router.post("/auth/signup", check("email", "Please enter a valid email").isEmail(),
        check("password", "Please enter a valid password").isLength({
            min: 6
        }), async(req,res,next) => {
        	const errors = validationResult(req);
	        if (!errors.isEmpty()) {
	        	let error = "";
	        	errors.errors.forEach(function(item,index){
	        		if(index!=0){
	        			error += "and ";
	        		}
	        		error += item.msg + " ";
	        	});
	            return res.status(400).render("signup",{message:error});
	        }
	        const {
	            email,
	            password
	        } = req.body;
	        try {
	            let user = await User.findOne({
	                email:email
	            });
	            if (user) {
	                return res.status(400).render("signup",{message:"Already registered!!!"});
	            }

	            user = new User({
	                email,
	                password
	            });

	            const salt = await bcrypt.genSalt(10);
	            user.password = await bcrypt.hash(password, salt);

	            await user.save();

	            const payload = {
	                user: {
	                    id: user.id
	                }
	            };

	            jwt.sign(
	                payload,
	                "key", {
	                    expiresIn: 10000
	                },
	                (err, token) => {
	                    if (err) throw err;
	                    res.cookie("token", token);
	                    res.status(200).redirect("/");
	                }
	            );
	        } catch (err) {
	            console.log(err.message);
	            res.status(500).redirect("/signup");
	        }
        });

router.get("/auth/signin", (req,res,next) => {
	let token = req.cookies["token"];
	try{
		const decoded = jwt.verify(token, "key");
		res.redirect("/");
	}
	catch(err){
		res.render('signin',{message:" "});
	}
});

router.post("/auth/signin", [check("email", "Please enter a valid email").isEmail(),
        check("password", "Please enter a valid password").isLength({
            min: 6
        })], async (req,res,next) => {
	const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("signin",{message:JSON.stringify(errors)});
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({
        email: email
      });
      if (!user)
        return res.status(400).render('signin',{message:"Not registered!!!"});

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).render("signin",{message:"Incorrect Password!!!"});

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        "key",
        {
          expiresIn: 3600
        },
        (err, token) => {
          if (err) throw err;
          res.cookie("token",token);
          res.status(200).redirect("/");
        }
      );
    } catch (e) {
      console.error(e);
      res.status(500).redirect("/signin");
    }
});

router.get("/crud", auth, async(req,res,next) => {
	let token = req.cookies["token"];
	const decoded = jwt.verify(token, "key");
	let id = decoded.user.id;
	Reservation.find({user:id}).exec().then(results=>{
		return res.status(200).render('crud',{array:results});
	}).catch(err => {
		return res.status(500).render('crud',{array:[]})
	});
});

router.post('/create', auth, (req,res,next) => {
	let token = req.cookies["token"];
	const decoded = jwt.verify(token, "key");
	let id = decoded.user.id;
	let {name,time} = req.body;
	let reservation = new Reservation({name:name, time:time, user:id});
	reservation.save((err)=>{
		if(err) return res.status(500).redirect('/crud');
		return res.redirect('/crud');
	});
});

router.post('/update',auth, (req,res,next) => {
	let {name,time,hid_name,hid_time} = req.body;
	let token = req.cookies["token"];
	const decoded = jwt.verify(token, "key");
	let id = decoded.user.id;
	Reservation.findOne({name:hid_name,time:hid_time}).exec().then(reservation => {
		Reservation.deleteOne({_id:reservation._id}).exec().then(err => {
			let reserve = new Reservation({name:name,time:time,user:id});
			reserve.save((err)=>{
				if(err) return res.status(500).redirect('/crud');
				return res.redirect('/crud');
			});
		});
	}).catch(err => {
		res.status(500).redirect("/crud");
	});
});

router.post('/delete',auth, (req,res,next) => {
	let {name,time} = req.body;
	Reservation.deleteOne({name:name, time:time}).exec().then(err => {
		if(err) return res.status(500).redirect("/crud");
		res.status(200).redirect("/crud");
	})
});

router.get("/", auth, async(req,res,next) => {
	let token = req.cookies["token"];
	const decoded = jwt.verify(token, "key");
	let email = (await User.findById(decoded.user.id).exec()).email;
	return res.render('main', {user: email});
});

router.post("/logout", async(req,res,next) => {
	res.cookie("token","");
	return res.redirect("/");
});

async function auth(req, res, next) {
  let token = req.cookies["token"];
  if (!token) return res.render('index');
  try {
    const decoded = jwt.verify(token, "key");
    req.user = decoded.user;
    next();
  } catch (e) {
    console.error(e);
    res.status(500).render('index');
  }
};

module.exports = router;
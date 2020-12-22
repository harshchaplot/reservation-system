const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const cookieParser = require('cookie-parser'); 

const routes = require("./Routes/main");
const db = require("./Config/db");

const app = express();

var corsOptions = {
  origin: "http://localhost:8080"
};

// Enable cors
app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());
app.use(cookieParser());

// Setting the templating engine
app.set('view engine', 'pug')

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// connecting to the mongodb database
db.connect();

// Routing
app.use("/",routes);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});


const mongoose = require("mongoose");

const Reservation = mongoose.model(
  "Reservation",
  new mongoose.Schema({
    name: String,
    time: String,
    user: {
    	type: mongoose.Schema.Types.ObjectId,
    	ref: 'User'
    }
  })
);

module.exports = Reservation;
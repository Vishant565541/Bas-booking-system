const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
  busName: { type: String, required: true },
  busNo:{type:Number,required:true,unique:true},
  busType:{type:String,required:true},

  
  routeFrom: { type: String, required: true },
  routeTo:{ type: String, required: true },
  arrivalTime:{type:String,required:true},
  departureTime:{ type: String, required: true },
  date: { type:Date, required: true },
  availableSeats: { type: Number, required: true },
  fare: { type: Number, required: true }
});

module.exports = mongoose.model("Bus", busSchema);

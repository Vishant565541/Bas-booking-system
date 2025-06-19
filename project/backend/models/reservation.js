const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Person", required: true },
  busId: { type: mongoose.Schema.Types.ObjectId, ref: "Bus", required: true },
  name: { type: String, required: true },
    email: { type: String, required: true },
  reservationDate: { type: String, required: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  reservationStatus: { type: String, default: "Confirmed" } // ✅ Add this field
    // departureTime: { type: String, required: true },
});

module.exports = mongoose.model("Reservation", reservationSchema);

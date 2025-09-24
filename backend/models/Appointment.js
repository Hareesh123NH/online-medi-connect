const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    appointmentDatetime: { type: Date, required: true },
    reason: { type: String },
    message:{ type: String },
    status: { 
      type: String, 
      enum: ["Accepted", "Rejected", "Pending"], 
      default: "Pending" 
    },
    createdAt: { type: Date, default: Date.now }
});
  
module.exports = mongoose.model("Appointment", appointmentSchema);
  
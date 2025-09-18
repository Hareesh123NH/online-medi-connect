const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    appointmentDatetime: { type: Date, required: true },
    reason: { type: String },
    status: { 
      type: String, 
      enum: ["Scheduled", "Completed", "Cancelled"], 
      default: "Scheduled" 
    },
    createdAt: { type: Date, default: Date.now }
});
  
module.exports = mongoose.model("Appointment", appointmentSchema);
  
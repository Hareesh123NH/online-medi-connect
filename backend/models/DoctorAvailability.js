const mongoose = require("mongoose");

const doctorAvailabilitySchema = new mongoose.Schema({
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    dayOfWeek: { 
      type: String, 
      enum: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], 
      required: true 
    },
    availableFrom: { type: String, required: true }, // HH:mm
    availableTo: { type: String, required: true }
});
  
module.exports = mongoose.model("DoctorAvailability", doctorAvailabilitySchema);
  
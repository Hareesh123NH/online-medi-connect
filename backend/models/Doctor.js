const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String },
    createdAt: { type: Date, default: Date.now }
});


const tempDoctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String },
    createdAt: { type: Date, default: Date.now }
  });
  
const TempDoctor= mongoose.model("TempDoctor", tempDoctorSchema);

const Doctor = mongoose.model("Doctor", doctorSchema);
  
module.exports = {
    TempDoctor,
    Doctor
  };
  
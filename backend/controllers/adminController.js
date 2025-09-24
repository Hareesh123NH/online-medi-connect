const bcrypt = require("bcryptjs");
const Admin= require("../models/Admin"); // Import Patient model
const {TempDoctor,Doctor} = require("../models/Doctor");



const signupAdmin = async (req, res) => {
    try {
      const { name, email, password, phone } = req.body;
  
      // 1. Check if required fields are given
      if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email and password are required" });
      }
  
      // 2. Check if email already exists
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({ message: "Email already registered" });
      }
  
      // 3. Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // 4. Create new admin
      const admin = new Admin({
        name,
        email,
        password: hashedPassword,
        phone
      });
  
      await admin.save();
  
      res.status(201).json({
        message: "Admin registered successfully",
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone
        }
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

//approve doctor

const approveDoctor = async (req, res) => {
    try {
      const { doctorId } = req.params; // temp doctor id
  
      // Find doctor in temp collection
      const tempDoctor = await TempDoctor.findById(doctorId);
      if (!tempDoctor) {
        return res.status(404).json({ message: "Doctor not found in pending list" });
      }
    // Check if doctor email already exists in main doctors table
    const existingDoctor = await Doctor.findOne({ email: tempDoctor.email });
    if (existingDoctor) {
      return res.status(400).json({ message: "Email already exists in doctors table" });
    }

      // Move to main Doctor collection
      const newDoctor = new Doctor({
        name: tempDoctor.name,
        specialization: tempDoctor.specialization,
        email: tempDoctor.email,
        password: tempDoctor.password, // already hashed
        phone: tempDoctor.phone
      });
  
      await newDoctor.save();
  
      // Remove from Temp collection
      await TempDoctor.findByIdAndDelete(doctorId);
  
      res.status(201).json({ message: "Doctor approved successfully", doctor: newDoctor });
    } catch (error) {
      console.error("Error in approving doctor:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
 //reject doctor
const rejectDoctor = async (req, res) => {
    try {
      const { doctorId } = req.params; // temp doctor id
  
      // Find and delete doctor from Temp collection
      const tempDoctor = await TempDoctor.findByIdAndDelete(doctorId);
  
      if (!tempDoctor) {
        return res.status(404).json({ message: "Doctor not found in pending list" });
      }
  
      res.status(200).json({ message: "Doctor rejected and removed from pending list" });
    } catch (error) {
      console.error("Error in rejecting doctor:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
 module.exports = { signupAdmin,approveDoctor,rejectDoctor };
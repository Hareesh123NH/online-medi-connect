const bcrypt = require("bcryptjs");
const Patient = require("../models/Patient"); // Import Patient model

const signup = async (req, res) => {
  try {
    const { name, email, password, phone, dob, gender } = req.body || {};

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // Check if email already exists
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new patient
    const newPatient = new Patient({
      name,
      email,
      password: hashedPassword,
      phone,
      dob,
      gender,
    });

    // Save patient
    const savedPatient = await newPatient.save();

    return res.status(201).json({
      message: "Patient registered successfully",
      patient_id: savedPatient._id,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { signup };

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Import Mongoose models
const Admin = require("../models/Admin");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * ✅ Unified Login (for patient/doctor/admin) - MongoDB
 */
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res
      .status(400)
      .json({ message: "Email, password and role are required" });
  }

  // Map roles to Mongoose models & id fields
  const roleMap = {
    patient: { model: Patient, idField: "_id" },
    doctor: { model: Doctor, idField: "_id" },
    admin: { model: Admin, idField: "_id" },
  };

  const roleInfo = roleMap[role];
  if (!roleInfo) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    // Find user in respective collection
    const user = await roleInfo.model.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ✅ Generate JWT with claims
    const token = jwt.sign(
      { id: user[roleInfo.idField], email: user.email, role },
      JWT_SECRET,
      { expiresIn: 3600 }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      role,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;

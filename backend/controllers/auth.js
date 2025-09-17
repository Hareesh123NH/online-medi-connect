const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();
const JWT_SECRET=process.env.JWT_SECRET;

/**
 * ✅ Unified Login (for patient/doctor/admin)
 */
router.post("/login", (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: "Email, password and role are required" });
  }

  // Map roles to tables & id fields
  const roleMap = {
    patient: { table: "patients", idField: "patient_id" },
    doctor: { table: "doctors", idField: "doctor_id" },
    admin: { table: "admins", idField: "admin_id" }
  };

  const roleInfo = roleMap[role];
  if (!roleInfo) {
    return res.status(400).json({ message: "Invalid role" });
  }

  // Query the respective table
  const sql = `SELECT * FROM ${roleInfo.table} WHERE email = ?`;
  db.query(sql, [email], async (err, result) => {
    if (err) return res.status(500).json({ error: err });

    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result[0];
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
      token
    });
  });
});

module.exports = router;

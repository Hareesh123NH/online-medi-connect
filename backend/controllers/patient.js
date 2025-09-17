const bcrypt = require("bcryptjs");
const db = require('../db');

const signup=async (req, res) => {
    try {
      const { name, email, password, phone, dob, gender } = req.body || {} ;
  
      if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required" });
      }
  
      // Check if email already exists
      db.query("SELECT * FROM patients WHERE email = ?", [email], async (err, result) => {
        if (err) return res.status(500).json({ error: err });
  
        if (result.length > 0) {
          return res.status(400).json({ message: "Email already registered" });
        }
  
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
  
        // Insert new patient
        const sql = `
          INSERT INTO patients (name, email, password, phone, dob, gender)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.query(sql, [name, email, hashedPassword, phone, dob, gender], (err, result) => {
          if (err) return res.status(500).json({ error: err });
  
          return res.status(201).json({ 
            message: "Patient registered successfully", 
            patient_id: result.insertId 
          });
        });
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  

module.exports={signup};
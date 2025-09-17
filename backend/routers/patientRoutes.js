const express=require('express');
const router = express.Router();

const patient=require('../controllers/patient');

// ✅ Signup route
router.post("/signup",patient.signup);

module.exports = router;
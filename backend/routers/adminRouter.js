const express = require('express');
const router = express.Router();

const { signupAdmin, approveDoctor, rejectDoctor, getDoctorRegisrations } = require('../controllers/adminController');



// ✅ Signup route
router.post("/signup", signupAdmin);

// Admin approves doctor
router.post("/approve/:doctorId", approveDoctor);

// Admin reject doctor
router.post("/reject/:doctorId", rejectDoctor);

router.get("/doctors", getDoctorRegisrations);

module.exports = router;
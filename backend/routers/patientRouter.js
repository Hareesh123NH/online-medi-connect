const express=require('express');
const router = express.Router();
const { signup,requestAppointment,getPendingAppointmentsForPatient, getAcceptedAppointmentsForPatient, getRejectedAppointmentsForPatient } = require("../controllers/patientController");
const authMiddleware = require('../middlewares/authMiddleware'); // sets req.user.id



// ✅ Signup route
router.post("/signup",signup);

// Patient requests an appointment with a doctor
router.post("/request/:doctorId", authMiddleware("patient"), requestAppointment);

//get pending appointments
router.get("/pending",authMiddleware("patient"),getPendingAppointmentsForPatient);


//get accepted appointments
router.get("/accept",authMiddleware("patient"),getAcceptedAppointmentsForPatient);


//get rejected appointments
router.get("/reject",authMiddleware("patient"),getRejectedAppointmentsForPatient);

module.exports = router;
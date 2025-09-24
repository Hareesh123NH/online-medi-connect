const express = require("express");
const { registerDoctor,updateAppointmentStatus, getPendingAppointmentsForDoctor, getAcceptedAppointmentsForDoctor, getRejectedAppointmentsForDoctor } = require("../controllers/doctorController");
const authMiddleware = require('../middlewares/authMiddleware'); 

const router = express.Router();

// Doctor signup → goes to temp
router.post("/register", registerDoctor);


// Doctor updates appointment status
router.patch("/appointments/:appointmentId/status", authMiddleware("doctor"), updateAppointmentStatus);



//get pending appointments
router.get("/pending",authMiddleware("doctor"),getPendingAppointmentsForDoctor);


//get accepted appointments
router.get("/accept",authMiddleware("doctor"),getAcceptedAppointmentsForDoctor);


//get rejected appointments
router.get("/reject",authMiddleware("doctor"),getRejectedAppointmentsForDoctor);


module.exports = router;
const bcrypt = require("bcryptjs");
const Patient = require("../models/Patient"); // Import Patient model
const Appointment = require("../models/Appointment");
const { Doctor } = require("../models/Doctor");

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

//request an appointment
const requestAppointment = async (req, res) => {
  try {
    const patientId = req.user.id; // from auth middleware
    const doctorId = req.params.doctorId;
    const { appointmentDatetime, reason } = req.body;

    // 1. Validate input
    if (!appointmentDatetime) {
      return res
        .status(400)
        .json({ message: "Appointment date and time are required" });
    }

    // Check doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const appointmentDate = new Date(appointmentDatetime);

    if (isNaN(appointmentDate.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid appointment date and time" });
    }

    // 2. Check if patient already has another appointment within ±30 minutes (with any doctor)
    const halfHourBefore = new Date(appointmentDate.getTime() - 30 * 60000);
    const halfHourAfter = new Date(appointmentDate.getTime() + 30 * 60000);

    const existingPatientAppointment = await Appointment.findOne({
      patient: patientId,
      appointmentDatetime: { $gte: halfHourBefore, $lte: halfHourAfter },
    }).populate("doctor", "name");

    if (existingPatientAppointment) {
      return res.status(400).json({
        message: `You already have an appointment request ${existingPatientAppointment.status} with Dr. ${existingPatientAppointment.doctor.name} at ${existingPatientAppointment.appointmentDatetime}`,
      });
    }

    // 3. Check if another patient already has an appointment with this doctor within ±30 minutes
    const conflictingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDatetime: { $gte: halfHourBefore, $lte: halfHourAfter },
      status: "Accepted",
    }).populate("patient", "name");

    if (conflictingAppointment) {
      return res.status(400).json({
        message: "Another patient already has an appointment around this time",
      });
    }

    // 4. Create appointment
    const appointment = new Appointment({
      doctor: doctorId,
      patient: patientId,
      appointmentDatetime: appointmentDate,
      reason,
    });

    await appointment.save();

    res.status(201).json({
      message: "Appointment requested successfully and is pending approval ",
      appointment: {
        id: appointment._id,
        datendTime: appointment.appointmentDatetime.toString(),
        status: appointment.status,
        reason: appointment.reason,
      },
    });
  } catch (error) {
    console.error("Error requesting appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

async function getHistoryForPatient(patientId, status) {
  // Fetch pending appointments for this patient
  const appointments = await Appointment.find({
    patient: patientId,
    status: status,
  })
    .populate("doctor", "name") // doctor details
    .sort({ appointmentDatetime: 1 }); // upcoming first

  return {
    message: `${status} appointments retrieved successfully`,
    count: appointments.length,
    appointments: appointments.map((appointment) => ({
      id: appointment._id,
      doctorName: appointment.doctor.name,
      appointmentDatetime: appointment.appointmentDatetime.toString(),
      reason: appointment.reason,
      status: appointment.status,
      message: appointment.message,
    })),
  };
}

//get: View all pending appointments for a patient
const getPendingAppointmentsForPatient = async (req, res) => {
  const patientId = req.user.id;

  try {
    return res
      .status(200)
      .json(await getHistoryForPatient(patientId, "Pending"));
  } catch (error) {
    console.error("Error fetching pending appointments:", error);

    return res.status(500).json({ message: "Server error" });
  }
};

const getAcceptedAppointmentsForPatient = async (req, res) => {
  const patientId = req.user.id;

  try {
    return res
      .status(200)
      .json(await getHistoryForPatient(patientId, "Accepted"));
  } catch (error) {
    console.error("Error fetching accepted appointments:", error);

    return res.status(500).json({ message: "Server error" });
  }
};

const getRejectedAppointmentsForPatient = async (req, res) => {
  const patientId = req.user.id;

  try {
    return res
      .status(200)
      .json(await getHistoryForPatient(patientId, "Rejected"));
  } catch (error) {
    console.error("Error fetching rejected appointments:", error);

    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  signup,
  requestAppointment,
  getPendingAppointmentsForPatient,
  getAcceptedAppointmentsForPatient,
  getRejectedAppointmentsForPatient,
};

const { TempDoctor, Doctor } = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const bcrypt = require("bcryptjs");

const registerDoctor = async (req, res) => {
    try {
        const { name, specialization, email, password, phone } = req.body;

        // Check if email already exists in Temp or Doctor collection
        const existing =
            (await TempDoctor.findOne({ email })) ||
            (await Doctor.findOne({ email }));

        if (existing) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save to temp collection
        const tempDoctor = new TempDoctor({
            name,
            specialization,
            email,
            password: hashedPassword,
            phone,
        });

        await tempDoctor.save();

        res
            .status(201)
            .json({ message: "Doctor registration pending admin approval" });
    } catch (error) {
        console.error("Error in doctor registration:", error);
        res.status(500).json({ message: "Server error" });
    }
};



const updateAppointmentStatus = async (req, res) => {
    try {
        const doctorId = req.user.id; // from middleware
        const { appointmentId } = req.params;
        const { status } = req.query;

        const { message } = req.body || {};

        // Validate status
        if (!["Accepted", "Rejected"].includes(status)) {
            return res.status(400).json({
                message: "Invalid status. Only 'Accepted' or 'Rejected' allowed",
            });
        }

        // Find appointment
        const appointment = await Appointment.findOne({
            _id: appointmentId,
            doctor: doctorId,
        });
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Check if already reacted
        if (appointment.status !== "Pending") {
            return res
                .status(400)
                .json({ message: "You already reacted to this appointment" });
        }

        // Update the appointment status and optional message
        appointment.status = status;
        if (message) appointment.message = message;

        await appointment.save();

        // If accepted → auto reject conflicting appointments
        if (status === "Accepted") {
            const appointmentTime = new Date(appointment.appointmentDatetime);
            const halfHourBefore = new Date(appointmentTime.getTime() - 30 * 60000);
            const halfHourAfter = new Date(appointmentTime.getTime() + 30 * 60000);

            await Appointment.updateMany(
                {
                    _id: { $ne: appointmentId },
                    status: "Pending",
                    $or: [{ doctor: doctorId }, { patient: appointment.patient }],
                    appointmentDatetime: { $gte: halfHourBefore, $lte: halfHourAfter },
                },
                {
                    $set: {
                        status: "Rejected",
                        message:
                            "Automatically rejected due to another accepted appointment on that time",
                    },
                }
            );
        }

        res.status(200).json({
            message: `Appointment ${status.toLowerCase()} successfully`,
            appointment: {
                appointmentDatetime: appointment.appointmentDatetime.toString(),
                reason: appointment.reason,
                message: appointment.message
            },
        });
    } catch (error) {
        console.error("Error updating appointment status:", error);
        res.status(500).json({ message: "Server error" });
    }
};




async function getHistoryForDoctor(doctorId, status) {
    // Fetch pending appointments for this patient
    const appointments = await Appointment.find({
        doctor: doctorId,
        status: status,
    })
        .populate("patient", "-_id name phone gender")
        .sort({ appointmentDatetime: 1 });

    return {
        message: `${status} appointments retrieved successfully`,
        count: appointments.length,
        appointments: appointments.map((appointment) => ({
            id: appointment._id,
            patient: appointment.patient,
            appointmentDatetime: appointment.appointmentDatetime.toString(),
            reason: appointment.reason,
            status: appointment.status,
            message: appointment.message,
        })),
    };
}

//get: View all pending appointments for a patient
const getPendingAppointmentsForDoctor = async (req, res) => {
    const doctorId = req.user.id;

    try {
        return res
            .status(200)
            .json(await getHistoryForDoctor(doctorId, "Pending"));
    } catch (error) {
        console.error("Error fetching pending appointments:", error);

        return res.status(500).json({ message: "Server error" });
    }
};

const getAcceptedAppointmentsForDoctor = async (req, res) => {
    const doctorId = req.user.id;

    try {
        return res
            .status(200)
            .json(await getHistoryForDoctor(doctorId, "Accepted"));
    } catch (error) {
        console.error("Error fetching accepted appointments:", error);

        return res.status(500).json({ message: "Server error" });
    }
};

const getRejectedAppointmentsForDoctor = async (req, res) => {
    const doctorId = req.user.id;

    try {
        return res
            .status(200)
            .json(await getHistoryForDoctor(doctorId, "Rejected"));
    } catch (error) {
        console.error("Error fetching rejected appointments:", error);

        return res.status(500).json({ message: "Server error" });
    }
};
module.exports = {
    registerDoctor, 
    updateAppointmentStatus,
    getAcceptedAppointmentsForDoctor,
    getRejectedAppointmentsForDoctor,
    getPendingAppointmentsForDoctor
};

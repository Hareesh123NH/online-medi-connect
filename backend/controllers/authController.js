
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Import Mongoose models
const Admin = require("../models/Admin");
const { Doctor } = require("../models/Doctor");
const Patient = require("../models/Patient");


const JWT_SECRET = process.env.JWT_SECRET;

/**
 * ✅ Unified Login (for patient/doctor/admin) - MongoDB
 */
const login = async (req, res) => {
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
};


// Common function
const updatePhoneNumber = async (req, res) => {
    try {
        const id = req.user.id;
        const userType = req.user.role;

        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ message: "Phone number is required" });
        }

        let Model;
        if (userType === "doctor") Model = Doctor;
        else if (userType === "admin") Model = Admin;
        else if (userType === "patient") Model = Patient;
        else {
            return res.status(400).json({ message: "Invalid user type" });
        }

        const updatedUser = await Model.findByIdAndUpdate(
            id,
            { phone }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: `${userType} not found` });
        }

        res.json({
            message: `${userType} phone number updated successfully`,
            user: {
                id: updatedUser._id,
                phone: updatedUser.phone,

            },
        });
    } catch (error) {
        console.error("Error updating phone:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const getProfile = async (req, res) => {
    try {
        const id = req.user.id;
        const userType = req.user.role;

        let Model;
        if (userType === "doctor") Model = Doctor;
        else if (userType === "admin") Model = Admin;
        else if (userType === "patient") Model = Patient;
        else {
            return res.status(400).json({ message: "Invalid user type" });
        }

        const user = await Model.findById(
            id
        ).select("-password -__v");

        res.json({
            user
        });
    } catch (error) {
        console.error("Error updating phone:", error);
        res.status(500).json({ message: "Server error" });
    }
};



module.exports = { login, updatePhoneNumber, getProfile };


const express = require("express");
const { login, updatePhoneNumber, getProfile } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/login", login);

router.patch("/update-phone",authMiddleware("admin","patient","doctor"), updatePhoneNumber);

router.get("/profile",authMiddleware("admin","patient","doctor"), getProfile);

module.exports=router;
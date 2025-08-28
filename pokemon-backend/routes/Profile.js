// routes/profile.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth"); // JWT doğrulaması

// Multer ayarları (uploads klasörüne kaydedilecek)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // backend projenin kökünde uploads klasörü oluştur
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// Fotoğraf yükleme route
router.post("/profile-pic", authMiddleware, upload.single("profilePic"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // profilePic alanını güncelle
    user.profilePic = req.file.filename; 
    await user.save();

    res.json({ message: "Profile picture updated", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
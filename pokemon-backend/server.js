import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const app = express();
const PORT = 5001;
const SECRET = "supersecretkey";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB Bağlantısı
const MONGODB_URI = "mongodb://localhost:27017/pokeapp";
mongoose.connect(MONGODB_URI)
  .then(() => console.log("🟢 MongoDB'ye başarıyla bağlandı."))
  .catch(err => console.error("🔴 MongoDB bağlantı hatası:", err));

// Kullanıcı Şeması ve Modeli
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String }, // Yeni alan: profil fotoğrafı dosya adı
  favorites: [
    { pokemonId: Number, pokemonName: String }
  ]
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

// CORS & JSON
app.use(cors({ origin: "http://localhost:3000", methods: ["GET","POST","PUT","DELETE","OPTIONS"], allowedHeaders: ["Content-Type","Authorization"] }));
app.use(express.json());

// Upload klasörü ve multer
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile-${req.user.id}${ext}`);
  }
});
const upload = multer({ storage });

// JWT Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token sağlanmadı" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Geçersiz token" });
  }
};

// --- Auth Routes ---
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: "Tüm alanlar zorunludur" });
  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ error: "Bu e-posta veya kullanıcı adı zaten kullanımda." });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, favorites: [] });
    await newUser.save();
    res.status(201).json({ message: "Kullanıcı başarıyla kaydedildi", user: { id: newUser._id, username, email } });
  } catch (err) { res.status(500).json({ error: "Kayıt sırasında bir hata oluştu." }); }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Geçersiz kimlik bilgileri" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Geçersiz kimlik bilgileri" });
    const token = jwt.sign({ id: user._id, email: user.email }, SECRET, { expiresIn: "7d" });
    res.json({ message: "Giriş başarılı", token, user: { id: user._id, username: user.username, email: user.email, favorites: user.favorites, profilePic: user.profilePic } });
  } catch (err) { res.status(500).json({ error: "Giriş sırasında bir hata oluştu." }); }
});

// Profile GET
app.get("/api/auth/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    res.json({ message: "Profil verileri getirildi", user: { id: user._id, username: user.username, email: user.email, favorites: user.favorites, profilePic: user.profilePic } });
  } catch (err) { res.status(500).json({ error: "Profil verileri getirilirken bir hata oluştu." }); }
});

// ProfilePic Upload
app.post("/api/profile/profile-pic", verifyToken, upload.single("profilePic"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Dosya yüklenmedi." });
  try {
    const user = await User.findById(req.user.id);
    user.profilePic = req.file.filename;
    await user.save();
    res.json({ message: "Profil fotoğrafı güncellendi.", user: { id: user._id, username: user.username, email: user.email, favorites: user.favorites, profilePic: user.profilePic } });
  } catch (err) { res.status(500).json({ error: "Profil fotoğrafı güncellenirken hata oluştu." }); }
});

// --- Favorites ---
app.post("/api/users/favorites/add", verifyToken, async (req, res) => {
  const { pokemonId, pokemonName } = req.body;
  if (!pokemonId || !pokemonName) return res.status(400).json({ error: "Pokémon ID ve Adı zorunludur." });
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    if (user.favorites.some(fav => fav.pokemonId === Number(pokemonId))) return res.status(409).json({ error: "Pokémon zaten favorilerde." });
    user.favorites.push({ pokemonId: Number(pokemonId), pokemonName });
    await user.save();
    res.json({ message: "Pokémon favorilere eklendi.", user: { id: user._id, username: user.username, email: user.email, favorites: user.favorites, profilePic: user.profilePic } });
  } catch (err) { res.status(500).json({ error: "Favori eklenirken bir hata oluştu." }); }
});

app.post("/api/users/favorites/remove", verifyToken, async (req, res) => {
  const { pokemonId } = req.body;
  if (!pokemonId) return res.status(400).json({ error: "Pokémon ID zorunludur." });
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    const initialLength = user.favorites.length;
    user.favorites = user.favorites.filter(f => f.pokemonId !== Number(pokemonId));
    if (user.favorites.length === initialLength) return res.status(404).json({ error: "Pokémon favorilerde bulunamadı." });
    await user.save();
    res.json({ message: "Pokémon favorilerden silindi.", user: { id: user._id, username: user.username, email: user.email, favorites: user.favorites, profilePic: user.profilePic } });
  } catch (err) { res.status(500).json({ error: "Favori silinirken bir hata oluştu." }); }
});

// Statik dosya (uploads) erişimi
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Sunucu
app.listen(PORT, () => console.log(`🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor`));
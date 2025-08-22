import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const app = express();
const PORT = 5001; // Genellikle 3000 ile çakışmaması için 5001 kullanılır.
const SECRET = "supersecretkey"; // Lütfen üretimde daha güvenli bir anahtar kullanın!

// MongoDB Bağlantısı
const MONGODB_URI = "mongodb://localhost:27017/pokeapp"; // Veritabanı adı 'pokeapp'

mongoose.connect(MONGODB_URI)
  .then(() => console.log("🟢 MongoDB'ye başarıyla bağlandı."))
  .catch(err => console.error("🔴 MongoDB bağlantı hatası:", err));

// Kullanıcı Şeması ve Modeli (Mongoose ile)
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  favorites: [ // Yeni alan: favori Pokémon'ları tutan bir dizi
    {
      pokemonId: { type: Number, required: true }, // Pokémon ID'si
      pokemonName: { type: String, required: true }, // Pokémon Adı
      // image: { type: String } // Pokémon Resmi (isteğe bağlı, API'den gelebilir, şimdilik kullanılmıyor)
    }
  ]
});

const User = mongoose.model("User", userSchema);

// 🟢 CORS Yapılandırması
app.use(cors({
  origin: "http://localhost:3000", // React uygulamasının çalıştığı adres
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 🟢 JSON Body Parser
app.use(express.json());

// 🔹 Auth Middleware - JWT token doğrulama
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("➡️ verifyToken çağrıldı. Authorization Header:", authHeader);

  if (!authHeader) {
    console.log("❌ Token sağlanmadı.");
    return res.status(401).json({ error: "Token sağlanmadı" });
  }

  const token = authHeader.split(" ")[1];
  console.log("🔑 Alınan Token:", token);

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // req.user = { id: user._id, email: user.email }
    console.log("✅ Token başarıyla doğrulandı. Kullanıcı ID:", req.user.id);
    next();
  } catch (err) {
    console.error("❌ JWT Doğrulama Hatası:", err.message); // Hata mesajını logla
    return res.status(401).json({ error: err.message === 'jwt expired' ? 'Token süresi doldu. Lütfen tekrar giriş yapın.' : 'Geçersiz token' });
  }
};

// 🔹 Register - Yeni kullanıcı kaydı
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Tüm alanlar zorunludur" });
  }

  try {
    // E-posta veya kullanıcı adı zaten kayıtlı mı kontrol et
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: "Bu e-posta veya kullanıcı adı zaten kullanımda." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Yeni kullanıcıyı favoriler alanı boş olarak oluştur
    const newUser = new User({ username, email, password: hashedPassword, favorites: [] });
    await newUser.save();

    console.log("✅ Yeni kullanıcı kaydedildi:", newUser.username);
    res.status(201).json({
      message: "Kullanıcı başarıyla kaydedildi",
      user: { id: newUser._id, username, email }
    });
  } catch (err) {
    console.error("🔴 Kayıt hatası:", err);
    res.status(500).json({ error: "Kayıt sırasında bir hata oluştu." });
  }
});

// 🔹 Login - Kullanıcı girişi
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Geçersiz kimlik bilgileri" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Geçersiz kimlik bilgileri" });

    // TOKEN SÜRESİNİ BURADA UZATIYORUZ! (1h -> 7d)
    const token = jwt.sign({ id: user._id, email: user.email }, SECRET, { expiresIn: "7d" });
    console.log("✅ Giriş başarılı. Token oluşturuldu.");
    res.json({
      message: "Giriş başarılı",
      token,
      // Giriş yapıldığında favorileri de içeren tam kullanıcı objesini gönder
      user: { id: user._id, username: user.username, email: user.email, favorites: user.favorites || [] } 
    });
  } catch (err) {
    console.error("🔴 Giriş hatası:", err);
    res.status(500).json({ error: "Giriş sırasında bir hata oluştu." });
  }
});

// 🔹 Profile - Kullanıcının kendi profilini ve favorilerini çekme (Auth gerekli)
app.get("/api/auth/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Şifreyi gösterme
    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });

    console.log("✅ Profil verileri getirildi:", user.username);
    res.json({
      message: "Profil verileri getirildi",
      // Favorileri de içeren tam kullanıcı objesini gönder
      user: { id: user._id, username: user.username, email: user.email, favorites: user.favorites || [] } 
    });
  } catch (err) {
    console.error("🔴 Profil hatası:", err);
    res.status(500).json({ error: "Profil verileri getirilirken bir hata oluştu." });
  }
});

// 🔹 Add Favorite Pokémon - Favori Pokémon ekleme (Auth gerekli)
// AuthContext'teki `addFavorite` fonksiyonunun beklediği POST isteğine uygun hale getirildi.
app.post("/api/users/favorites/add", verifyToken, async (req, res) => {
  const { pokemonId, pokemonName } = req.body; 
  if (!pokemonId || !pokemonName) {
    return res.status(400).json({ error: "Pokémon ID ve Adı zorunludur." });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });

    // Zaten favorilerde olup olmadığını kontrol et
    // Favori ID'sinin Number tipinde olduğundan emin ol
    const isAlreadyFavorite = user.favorites.some(fav => fav.pokemonId === Number(pokemonId));
    if (isAlreadyFavorite) {
      return res.status(409).json({ error: "Pokémon zaten favorilerde." });
    }

    // Pokémon'u favorilere ekle (pokemonId'yi Number olarak kaydet)
    user.favorites.push({ pokemonId: Number(pokemonId), pokemonName }); 
    await user.save(); // Kullanıcı belgesini kaydet

    console.log(`✅ ${pokemonName} favorilere eklendi.`);
    // Güncel kullanıcı nesnesini favorileriyle birlikte geri gönder
    res.status(200).json({ message: "Pokémon favorilere eklendi.", user: { id: user._id, username: user.username, email: user.email, favorites: user.favorites } });
  } catch (err) {
    console.error("🔴 Favori eklenirken hata:", err);
    res.status(500).json({ error: "Favori eklenirken bir hata oluştu." });
  }
});

// 🔹 Remove Favorite Pokémon - Favori Pokémon silme (Auth gerekli)
// AuthContext'teki `removeFavorite` fonksiyonunun beklediği POST isteğine uygun hale getirildi.
app.post("/api/users/favorites/remove", verifyToken, async (req, res) => {
  const { pokemonId } = req.body; // Body'den pokemonId bekleniyor
  if (!pokemonId) {
    return res.status(400).json({ error: "Pokémon ID zorunludur." });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı" });

    const initialLength = user.favorites.length;
    // pokemonId'yi Number'a çevirerek filtreleme yap
    user.favorites = user.favorites.filter(p => p.pokemonId !== Number(pokemonId));

    if (user.favorites.length === initialLength) {
      return res.status(404).json({ error: "Pokémon favorilerde bulunamadı." });
    }

    await user.save(); // Kullanıcı belgesini kaydet

    console.log(`✅ Pokémon ID ${pokemonId} favorilerden silindi.`);
    // Güncel kullanıcı nesnesini favorileriyle birlikte geri gönder
    res.status(200).json({ message: "Pokémon favorilerden silindi.", user: { id: user._id, username: user.username, email: user.email, favorites: user.favorites } });
  } catch (err) {
    console.error("🔴 Favori silinirken hata:", err);
    res.status(500).json({ error: "Favori silinirken bir hata oluştu." });
  }
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});

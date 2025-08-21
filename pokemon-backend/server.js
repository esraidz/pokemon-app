import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
const PORT = 5000;
const SECRET = "supersecretkey";

// 🟢 CORS: tüm yöntemler ve tüm header’lar izinli
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 🟢 JSON parse
app.use(express.json());

// Mock DB
const users = [];

// 🔹 Auth Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// 🔹 Register
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: "All fields are required" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: Date.now(), username, email, password: hashedPassword };
  users.push(newUser);

  res.status(201).json({
    message: "User registered successfully",
    user: { id: newUser.id, username, email }
  });
});

// 🔹 Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "1h" });
  res.json({
    message: "Login successful",
    token,
    user: { id: user.id, username: user.username, email: user.email }
  });
});

// 🔹 Profile
app.get("/api/auth/profile", verifyToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ id: user.id, username: user.username, email: user.email });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
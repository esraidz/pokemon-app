// src/pages/Login.js
import React, { useState } from "react";
import { Box, TextField, Button, Typography, Alert, CircularProgress } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // AuthContext'i içeri aktar

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // AuthContext'ten login fonksiyonunu al
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Yükleme durumu için state

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // İstek başlamadan yükleme durumunu ayarla

    try {
      const res = await axios.post("http://localhost:5001/api/auth/login", formData);
      console.log(res.data);

      // Başarılı giriş sonrası token ve kullanıcı bilgilerini AuthContext'e ve localStorage'a kaydet
      login(res.data.token, res.data.user);

      // Burası değişti: Başarılı girişte artık ana sayfaya yönlendiriyoruz
      navigate("/");
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false); // İstek bitince yükleme durumunu sıfırla
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 10,
        p: 4,
        boxShadow: 3,
        borderRadius: 3,
        backgroundColor: "rgba(255,255,255,0.9)",
        textAlign: "center",
      }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        Login
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          name="email"
          fullWidth
          margin="normal"
          value={formData.email}
          onChange={handleChange}
          type="email"
          required
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          fullWidth
          margin="normal"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2, py: 1.5, fontSize: "1.1rem" }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
        </Button>
      </form>
      <Typography variant="body2" sx={{ mt: 2 }}>
        Don't have an account?{" "}
        <Button onClick={() => navigate("/register")} size="small">
          Register
        </Button>
      </Typography>
    </Box>
  );
}

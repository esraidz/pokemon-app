// src/pages/Register.js
import React, { useState } from "react";
// Alert artık kullanılmadığı için import listesinden çıkarıldı
import { Box, TextField, Button, Typography } from "@mui/material"; 
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please check again."); 
      return;
    }

    try {
      const { confirmPassword, ...dataToSend } = formData; 
      const res = await axios.post("http://localhost:5001/api/auth/register", dataToSend);
      console.log(res.data);
      alert("Registration successful!"); 
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Something went wrong"); 
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 10,
        p: 4,
        borderRadius: 3,
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        backgroundColor: "rgba(255,255,255,0.95)",
      }}
    >
      <Typography variant="h5" mb={3} textAlign="center">
        Register 
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Username" 
          name="username"
          value={formData.username}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Email" 
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Password" 
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Confirm Password" 
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        {error && (
          <Typography color="error" mt={1} mb={1}>
            {error}
          </Typography>
        )}
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Register 
        </Button>
      </form>
    </Box>
  );
};

export default Register;

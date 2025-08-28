// src/pages/Profile.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, token, setUser, loading: authLoading } = useAuth();
  const [apiLoading, setApiLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null); // 🆕 Önizleme URL'si

  useEffect(() => {
    if (!authLoading && token) {
      setApiLoading(false);
    }
  }, [authLoading, token]);

  // Dosya seçildiğinde
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file)); // 🆕 Önizleme oluştur
    }
  };

  // Upload işlemi
  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("profilePic", selectedFile);

    try {
      const res = await axios.post("http://localhost:5001/api/profile/profile-pic", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // 🆕 Cache kırmak için timestamp ekle
      setUser({
        ...res.data.user,
        profilePic: res.data.user.profilePic + "?t=" + new Date().getTime()
      });

      setSnackbar({ open: true, message: "Profile picture updated!", severity: "success" });
      setSelectedFile(null);
      setPreview(null); // Önizleme sıfırla
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Error uploading profile picture.", severity: "error" });
    }
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  if (authLoading || apiLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading profile...
        </Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Typography variant="h6">Profile data not available. Please log in.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 10, p: 4, boxShadow: 3, borderRadius: 3, textAlign: "center", backgroundColor: "rgba(255,255,255,0.9)" }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user.username}!
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
        Email: {user.email}
      </Typography>

      {/* Profil Fotoğrafı */}
      <Avatar
        src={preview || (user.profilePic ? `http://localhost:5001/uploads/${user.profilePic}` : "")}
        alt="Profile Picture"
        sx={{ width: 120, height: 120, mx: "auto", mb: 2 }}
      />

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "block", margin: "10px auto" }}
      />
      <Button
        variant="contained"
        onClick={handleUpload}
        disabled={!selectedFile}
        sx={{ mb: 3 }}
      >
        Upload
      </Button>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          action={
            <IconButton aria-label="close" color="inherit" size="small" onClick={handleSnackbarClose}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
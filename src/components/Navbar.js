// src/components/Navbar.js
import React, { useState } from "react";
import { AppBar, Toolbar, IconButton, Typography, Menu, MenuItem, Box, Tooltip, Button, Divider, Avatar } from "@mui/material"; // Avatar eklendi
import { Menu as MenuIcon } from "@mui/icons-material"; // AccountCircle kaldırıldı
import { Link, useNavigate } from "react-router-dom";
import { keyframes } from "@mui/system";
import { useAuth } from "../context/AuthContext";

// Glow efekti
const glow = keyframes`
  0%,100% { text-shadow: 0 0 6px #fff, 0 0 10px #ffcc00; }
  50% { text-shadow: 0 0 10px #fff, 0 0 20px #ffcc00; }
`;

// Pokéball döndürme animasyonu
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const playPikachuSound = () => {
    const audio = new Audio('/sounds/ssvid.net--POKEMON-Capture-Sound-Effect-Free-Ringtone-Download.mp3');
    audio.play();
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => { logout(); handleMenuClose(); navigate("/"); };
  const handleProfileClick = () => { handleMenuClose(); navigate("/profile"); };
  const handleFavoritesClick = () => { handleMenuClose(); navigate("/favorites"); };

  const links = [
    { text: "Home", path: "/" },
    { text: "Pokémon List", path: "/pokemons" },
    { text: "FAQ", path: "/faq" },
    { text: "Pika", path: "/game" },
  ];

  const navLinkStyle = {
    textDecoration: "none",
    color: "#fff",
    fontWeight: 500,
    px: 2,
    py: 1,
    borderRadius: 2,
    transition: "0.3s",
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.1)",
      textShadow: "0 0 8px #fff, 0 0 16px #ffcc00",
    },
  };

  return (
    <AppBar
      position="static"
      sx={{
        background: "rgba(58, 76, 202, 0.85)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo/Başlık */}
        <Box sx={{ display: "flex", alignItems: "center", cursor: 'pointer' }} onClick={playPikachuSound}>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              textDecoration: "none",
              color: "#fff",
              fontWeight: "bold",
              letterSpacing: 1,
              animation: `${glow} 2s ease-in-out infinite`,
              display: "flex",
              alignItems: "center",
            }}
          >
            Pokémon App
            <Box
              component="img"
              src="/pngimg.com - pokeball_PNG22.png"
              alt="Pokéball"
              sx={{
                width: 28,
                height: 28,
                ml: 1,
                animation: `${spin} 1.5s linear infinite`,
              }}
            />
          </Typography>
        </Box>

        {/* Desktop Menü ve Kullanıcı Alanı */}
        <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center" }}>
          {links.map((link) => (
            <Typography key={link.text} component={Link} to={link.path} sx={navLinkStyle}>
              {link.text}
            </Typography>
          ))}

          {user ? (
            <>
              <Tooltip title={user.username}>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenuOpen}
                  color="inherit"
                  sx={{ ml: 2 }}
                >
                  <Avatar
                    src={user.profilePic ? `http://localhost:5001/uploads/${user.profilePic}` : ""}
                    alt={user.username}
                  />
                </IconButton>
              </Tooltip>

              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    borderRadius: 2,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    backgroundColor: 'rgba(245, 245, 245, 0.98)',
                    color: '#3A4CCA',
                    '& .MuiMenuItem-root': {
                      py: 1.5,
                      px: 2,
                      color: '#3A4CCA',
                      '&:hover': { backgroundColor: 'rgba(58, 76, 202, 0.1)' },
                    },
                  },
                }}
              >
                <Typography variant="subtitle2" sx={{ px: 2, pt: 1.5, pb: 0.5, color: '#3A4CCA', fontWeight: 'bold' }}>
                  Hello, {user.username}!
                </Typography>
                <Divider sx={{ my: 0.5, borderColor: 'rgba(58, 76, 202, 0.2)' }} />
                <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
                <MenuItem onClick={handleFavoritesClick}>Favorites</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, ml: 2 }}>
              <Button component={Link} to="/login" sx={navLinkStyle}>Login</Button>
              <Button component={Link} to="/register" sx={navLinkStyle}>Register</Button>
            </Box>
          )}
        </Box>

        {/* Mobil Menü */}
        <Box sx={{ display: { xs: "flex", sm: "none" } }}>
          <IconButton color="inherit" onClick={handleMenuOpen}><MenuIcon /></IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                borderRadius: 2,
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                border: '1px solid rgba(0,0,0,0.05)',
                backgroundColor: 'rgba(245, 245, 245, 0.98)',
                color: '#3A4CCA',
                '& .MuiMenuItem-root': {
                  py: 1.5,
                  px: 2,
                  color: '#3A4CCA',
                  '&:hover': { backgroundColor: 'rgba(58, 76, 202, 0.1)' },
                },
              },
            }}
          >
            {user ? (
              <>
                <Typography variant="subtitle2" sx={{ px: 2, pt: 1.5, pb: 0.5, color: '#3A4CCA', fontWeight: 'bold' }}>
                  Hello, {user.username}!
                </Typography>
                <Divider sx={{ my: 0.5, borderColor: 'rgba(58, 76, 202, 0.2)' }} />
                <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
                <MenuItem onClick={handleFavoritesClick}>Favorites</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </>
            ) : (
              <>
                {links.map((link) => (
                  <MenuItem key={link.text} component={Link} to={link.path} onClick={handleMenuClose}>
                    {link.text}
                  </MenuItem>
                ))}
                <MenuItem component={Link} to="/login" onClick={handleMenuClose}>Login</MenuItem>
                <MenuItem component={Link} to="/register" onClick={handleMenuClose}>Register</MenuItem>
              </>
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
// src/components/Navbar.js
import React, { useState } from "react";
import { AppBar, Toolbar, IconButton, Typography, Menu, MenuItem, Box, Tooltip } from "@mui/material";
import { Menu as MenuIcon, AccountCircle } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { keyframes } from "@mui/system";

// Glow efekti
const glow = keyframes`
  0%,100% { text-shadow: 0 0 6px #fff, 0 0 10px #ffcc00; }
  50% { text-shadow: 0 0 10px #fff, 0 0 20px #ffcc00; }
`;

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileEl, setProfileEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleProfileOpen = (event) => setProfileEl(event.currentTarget);
  const handleProfileClose = () => setProfileEl(null);

  const links = [
    { text: "Home", path: "/" },
    { text: "Pokémon List", path: "/pokemons" },
    { text: "FAQ", path: "/faq" },
  ];

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
        {/* Logo */}
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
          }}
        >
          Pokémon App
        </Typography>

        {/* Desktop Menu */}
        <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 3, alignItems: "center" }}>
          {links.map((link) => (
            <Typography
              key={link.text}
              component={Link}
              to={link.path}
              sx={{
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
              }}
            >
              {link.text}
            </Typography>
          ))}

          {/* Profil Icon */}
          <Tooltip title="Account">
            <IconButton color="inherit" onClick={handleProfileOpen}>
              <AccountCircle />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={profileEl}
            open={Boolean(profileEl)}
            onClose={handleProfileClose}
          >
            <MenuItem component={Link} to="/register" onClick={handleProfileClose}>Register</MenuItem>
            <MenuItem component={Link} to="/login" onClick={handleProfileClose}>Login</MenuItem>
          </Menu>
        </Box>

        {/* Mobile Menu */}
        <Box sx={{ display: { xs: "flex", sm: "none" } }}>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {links.map((link) => (
              <MenuItem
                key={link.text}
                component={Link}
                to={link.path}
                onClick={handleMenuClose}
              >
                {link.text}
              </MenuItem>
            ))}
            <MenuItem component={Link} to="/register" onClick={handleMenuClose}>
              Register
            </MenuItem>
            <MenuItem component={Link} to="/login" onClick={handleMenuClose}>
              Login
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
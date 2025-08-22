// src/components/Navbar.js
import React, { useState } from "react";
import { AppBar, Toolbar, IconButton, Typography, Menu, MenuItem, Box, Tooltip, Button, Divider } from "@mui/material";
import { Menu as MenuIcon, AccountCircle } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { keyframes } from "@mui/system";
import { useAuth } from "../context/AuthContext"; // AuthContext'i içeri aktar

// Glow efekti
const glow = keyframes`
  0%,100% { text-shadow: 0 0 6px #fff, 0 0 10px #ffcc00; }
  50% { text-shadow: 0 0 10px #fff, 0 0 20px #ffcc00; }
`;

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // AuthContext'ten user ve logout fonksiyonlarını al
  
  const [anchorEl, setAnchorEl] = useState(null); // Mobil menü veya profil menüsü için anchor elementi

  // Menüyü açma fonksiyonu (hem mobil hem de profil menüsü için)
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Menüyü kapatma fonksiyonu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Çıkış yapma fonksiyonu
  const handleLogout = () => {
    logout(); // AuthContext'ten çıkış yap
    handleMenuClose(); // Menüyü kapat
    navigate("/"); // Ana sayfaya yönlendir
  };

  // Profil sayfasına yönlendirme fonksiyonu
  const handleProfileClick = () => {
    handleMenuClose(); // Menüyü kapat
    navigate("/profile"); // Profil sayfasına yönlendir (bu rota henüz oluşturulmadıysa oluşturulmalı)
  };

  // Favoriler sayfasına yönlendirme fonksiyonu
  const handleFavoritesClick = () => {
    handleMenuClose(); // Menüyü kapat
    navigate("/favorites"); // Favoriler sayfasına yönlendir (bu rota henüz oluşturulmadıysa oluşturulmalı)
  };

  // Ana navigasyon linkleri
  const links = [
    { text: "Home", path: "/" },
    { text: "Pokémon List", path: "/pokemons" },
    { text: "FAQ", path: "/faq" },
  ];

  // Navigasyon linkleri için ortak stil
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
        backdropFilter: "blur(10px)", // AppBar'da hafif bir bulanıklık
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo/Başlık */}
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

        {/* Desktop Menü ve Kullanıcı Alanı */}
        <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center" }}>
          {/* Ana Navigasyon Linkleri (her zaman görünür) */}
          {links.map((link) => (
            <Typography
              key={link.text}
              component={Link}
              to={link.path}
              sx={navLinkStyle}
            >
              {link.text}
            </Typography>
          ))}

          {/* Profil/Giriş Alanı */}
          {user ? (
            // Kullanıcı giriş yapmışsa: Profil İkonu (Tooltip ile kullanıcı adı)
            <>
              <Tooltip title={user.username}> {/* Mouse üzerine gelince kullanıcı adını göster */}
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenuOpen} // İkona tıklayınca menüyü aç
                  color="inherit"
                  sx={{ ml: 2 }} // Navigasyon linklerinden ayırmak için sol marj
                >
                  <AccountCircle />
                </IconButton>
              </Tooltip>
              
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom', // Menüyü ikonun altında aç
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                // Menünün kağıt stilini ve yükseltisini ayarlayarak "çok mavi" ve "blurlu" hissiyatı azaltma
                PaperProps={{
                  sx: {
                    borderRadius: 2,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)', // Yumuşak bir gölge
                    border: '1px solid rgba(0,0,0,0.05)', // Çok ince, neredeyse görünmez bir kenarlık
                    backgroundColor: 'rgba(245, 245, 245, 0.98)', // Çok açık gri, neredeyse beyaz ve çok az şeffaf
                    color: '#3A4CCA', // Metin rengi koyu mavi
                    // Menünün kendi içindeki yazıları bulanık yapmaması için backdropFilter burada kullanılmadı.
                    '& .MuiMenuItem-root': {
                      py: 1.5,
                      px: 2,
                      color: '#3A4CCA', // Menü öğelerinin metin rengi
                      '&:hover': {
                        backgroundColor: 'rgba(58, 76, 202, 0.1)', // Hafif bir hover efekti
                      },
                    },
                  },
                }}
              >
                {/* Menünün en üstünde kullanıcı adını göster (MenuItem yerine Typography kullanıldı) */}
                <Typography variant="subtitle2" sx={{ px: 2, pt: 1.5, pb: 0.5, color: '#3A4CCA', fontWeight: 'bold' }}>
                    Hello, {user.username}!
                </Typography>
                <Divider sx={{ my: 0.5, borderColor: 'rgba(58, 76, 202, 0.2)' }} /> {/* Ayırıcı çizgi */}
                
                <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
                <MenuItem onClick={handleFavoritesClick}>Favorites</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            // Kullanıcı giriş yapmamışsa: Giriş ve Kayıt "link" butonları
            <Box sx={{ display: 'flex', gap: 2, ml: 2 }}> {/* Navigasyon linklerinden ayırmak için sol marj */}
                <Button 
                    component={Link} 
                    to="/login" 
                    sx={navLinkStyle} // Ortak stili kullan
                >
                    Login
                </Button>
                <Button 
                    component={Link} 
                    to="/register" 
                    sx={navLinkStyle} // Ortak stili kullan
                >
                    Register
                </Button>
            </Box>
          )}
        </Box>

        {/* Mobil Menü */}
        <Box sx={{ display: { xs: "flex", sm: "none" } }}>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{ // Mobil menü için de aynı stil ayarlamaları
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
                  '&:hover': {
                    backgroundColor: 'rgba(58, 76, 202, 0.1)',
                  },
                },
              },
            }}
          >
            {user ? (
                // Mobil menüde girişliyse: Sadece profil, favoriler ve çıkış seçenekleri
                <>
                    {/* Mobil menüde de kullanıcı adını göster (Typography kullanıldı) */}
                    <Typography variant="subtitle2" sx={{ px: 2, pt: 1.5, pb: 0.5, color: '#3A4CCA', fontWeight: 'bold' }}>
                        Hello, {user.username}!
                    </Typography>
                    <Divider sx={{ my: 0.5, borderColor: 'rgba(58, 76, 202, 0.2)' }} />
                    <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
                    <MenuItem onClick={handleFavoritesClick}>Favorites</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </>
            ) : (
                // Mobil menüde girişli değilse: Ana navigasyon ve giriş/kayıt seçenekleri
                <>
                    {links.map((link) => (
                    <MenuItem
                        key={link.text}
                        component={Link}
                        to={link.path}
                        onClick={handleMenuClose}
                        sx={{ // Mobil menüdeki linkler için de hover efekti
                            '&:hover': {
                                backgroundColor: 'rgba(58, 76, 202, 0.15)',
                            }
                        }}
                    >
                        {link.text}
                    </MenuItem>
                    ))}
                    <MenuItem component={Link} to="/login" onClick={handleMenuClose}>
                        Login
                    </MenuItem>
                    <MenuItem component={Link} to="/register" onClick={handleMenuClose}>
                        Register
                    </MenuItem>
                </>
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

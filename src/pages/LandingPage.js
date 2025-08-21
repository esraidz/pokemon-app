// src/pages/LandingPage.js
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { keyframes } from "@mui/system";
import backgroundImage from "../assets/wp8695829-pokemon-aesthetic-desktop-wallpapers.png";

// Pokémon sarısı parıltı + hafif zıplama
const glow = keyframes`
  0% { text-shadow: -2px -2px 0 #2a44b5, 2px -2px 0 #2a44b5, -2px 2px 0 #2a44b5, 2px 2px 0 #2a44b5, 0 0 10px rgba(255,235,59,.7); }
  50% { text-shadow: -2px -2px 0 #2a44b5, 2px -2px 0 #2a44b5, -2px 2px 0 #2a44b5, 2px 2px 0 #2a44b5, 0 0 22px rgba(255,235,59,1); }
  100% { text-shadow: -2px -2px 0 #2a44b5, 2px -2px 0 #2a44b5, -2px 2px 0 #2a44b5, 2px 2px 0 #2a44b5, 0 0 10px rgba(255,235,59,.7); }
`;
const bounce = keyframes`
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

// Alt yazıya hafif yanıp sönme efekti
const flicker = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.75; }
`;

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/pokemons"); // ✅ route ile eşleştirildi
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        p: 3,
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "#fff",
      }}
    >
      {/* Başlık */}
      <Typography
        variant="h2"
        sx={{
          mb: 2,
          fontWeight: "900",
          letterSpacing: { xs: 1, md: 2 },
          color: "#FFCC00", // Pokémon sarısı
          textShadow:
            "-2px -2px 0 #2a44b5, 2px -2px 0 #2a44b5, -2px 2px 0 #2a44b5, 2px 2px 0 #2a44b5, 0 0 14px rgba(255,235,59,.9)",
          animation: `${glow} 2.4s ease-in-out infinite, ${bounce} 3.2s ease-in-out infinite`,
          fontSize: { xs: "2rem", sm: "2.6rem", md: "3.2rem", lg: "3.6rem" },
        }}
      >
        Welcome to Pokémon World
      </Typography>

      {/* Alt yazı - NET BEYAZ + hafif yanıp sönme */}
      <Typography
        variant="h5"
        sx={{
          mb: 4,
          fontWeight: 600,
          color: "#ffffff", // net beyaz
          textShadow: "0 1px 3px rgba(0,0,0,0.6)", // hafif gölge
          fontSize: { xs: "1rem", sm: "1.15rem", md: "1.25rem" },
          animation: `${flicker} 1.5s ease-in-out infinite`, // hafif yanıp sönme
        }}
      >
        Discover, search, and compare your favorite Pokémons!
      </Typography>

      {/* Buton */}
      <Button
        variant="contained"
        color="secondary"
        size="large"
        onClick={handleStart}
        sx={{
          fontWeight: "bold",
          px: 4,
          py: 1.5,
          boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
          transition: "transform .2s ease, box-shadow .2s ease",
          "&:hover": {
            transform: "translateY(-2px) scale(1.03)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
          },
        }}
      >
        Get Started
      </Button>
    </Box>
  );
};

export default LandingPage;
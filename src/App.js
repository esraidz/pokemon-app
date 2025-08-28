// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PokemonListPage from "./pages/PokemonListPage";
import LandingPage from "./pages/LandingPage";
import FAQPage from "./pages/FAQPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import FavoritesPage from "./pages/FavoritesPage";
import PikachuGame from "./components/PikachuGame"; // 🆕 Pikachu Game import
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pokemons" element={<PokemonListPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/game" element={<PikachuGame />} /> {/* 🆕 Pikachu Game rotası */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
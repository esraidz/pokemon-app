// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PokemonListPage from "./pages/PokemonListPage";
import LandingPage from "./pages/LandingPage";
import FAQPage from "./pages/FAQPage";
import Register from "./pages/Register"; // yeni
import Login from "./pages/Login";       // yeni

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pokemons" element={<PokemonListPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
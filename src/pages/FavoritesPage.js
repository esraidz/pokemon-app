// src/pages/FavoritesPage.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Snackbar,
  Alert,
  Divider,
  Avatar,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// helper: id varsa official-artwork, yoksa isimle fallback
const getPokemonImageUrl = (pokemon) => {
  const id = pokemon?.pokemonId || pokemon?.id;
  const name = (pokemon?.pokemonName || pokemon?.name || "").toLowerCase();

  if (id) {
    // büyük görsel (official artwork)
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }
  if (name) {
    // isimle fallback (pokemondb artwork)
    return `https://img.pokemondb.net/artwork/large/${name}.jpg`;
  }
  return "";
};

const getFallbackImageUrl = (pokemon) => {
  const id = pokemon?.pokemonId || pokemon?.id;
  const name = (pokemon?.pokemonName || pokemon?.name || "").toLowerCase();

  if (id) {
    // küçük sprite fallback
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  }
  if (name) {
    // isimle küçük sprite fallback
    return `https://img.pokemondb.net/sprites/home/normal/${name}.png`;
  }
  return "https://placehold.co/96x96?text=?";
};

export default function FavoritesPage() {
  const { user, token, loading: authLoading, removeFavorite } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    if (!authLoading) {
      if (!token || !user) {
        setError("No active session. Please log in.");
        return;
      }
      setError("");
    }
  }, [authLoading, token, user]);

  const handleRemoveFavorite = async (pokemonId, pokemonName) => {
    try {
      await removeFavorite(pokemonId);
      setSnackbarMessage(`${pokemonName} successfully removed from favorites.`);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error removing favorite:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "An error occurred while removing favorite.";
      setSnackbarMessage(`Error: ${errorMessage}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  if (authLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading favorites...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 10, p: 4, textAlign: "center", bgcolor: "background.paper", borderRadius: 2, boxShadow: 3 }}>
        <Typography color="error" variant="h6" gutterBottom>{error}</Typography>
        <Button variant="contained" onClick={() => navigate("/login")} sx={{ mt: 2 }}>
          Log In
        </Button>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Typography variant="h6">You must log in to see your favorites list.</Typography>
        <Button variant="contained" onClick={() => navigate("/login")} sx={{ mt: 2, ml: 2 }}>
          Log In
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        mt: 10,
        p: 4,
        boxShadow: 3,
        borderRadius: 3,
        textAlign: "center",
        bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(50,50,50,0.9)" : "rgba(255,255,255,0.9)",
        color: (theme) => theme.palette.mode === "dark" ? "#e0e0e0" : "inherit",
        transition: "background-color 0.3s ease-in-out, color 0.3s ease-in-out",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Favorite Pokemons
      </Typography>

      {user.favorites && user.favorites.length > 0 ? (
        <List
          sx={{
            width: "100%",
            maxWidth: 420,
            mx: "auto",
            borderRadius: "8px",
            boxShadow: 1,
            bgcolor: (theme) => theme.palette.mode === "dark" ? "#424242" : "background.paper",
            color: (theme) => theme.palette.mode === "dark" ? "#e0e0e0" : "inherit",
            transition: "background-color 0.3s ease-in-out, color 0.3s ease-in-out",
          }}
        >
          {user.favorites.map((pokemon, index) => {
            const src = getPokemonImageUrl(pokemon);
            const fallback = getFallbackImageUrl(pokemon);

            return (
              <React.Fragment key={`${pokemon.pokemonId}-${pokemon.pokemonName}-${index}`}>
                <ListItem
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemoveFavorite(pokemon.pokemonId, pokemon.pokemonName)}
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  }
                >
                  <Avatar
                    src={src}
                    alt={pokemon.pokemonName}
                    sx={{ width: 50, height: 50, mr: 2 }}
                    imgProps={{
                      onError: (e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = fallback;
                      },
                      loading: "lazy",
                    }}
                  />
                  <ListItemText
                    primary={pokemon.pokemonName}
                    primaryTypographyProps={{ textTransform: "capitalize" }}
                  />
                </ListItem>
                {index < user.favorites.length - 1 && <Divider component="li" />}
              </React.Fragment>
            );
          })}
        </List>
      ) : (
        <Typography variant="body1" color="text.secondary">
          You don't have any favorite Pokémon yet. You can add them from the Pokémon list!
        </Typography>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/pokemons")}
        sx={{ mt: 4 }}
      >
        Go Back to Pokémon List
      </Button>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%", borderRadius: "8px", boxShadow: 3 }}
          action={
            <IconButton aria-label="close" color="inherit" size="small" onClick={handleSnackbarClose}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
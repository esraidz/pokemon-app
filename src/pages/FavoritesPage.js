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
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // useAuth hook from AuthContext

export default function FavoritesPage() {
  const { user, token, loading: authLoading, logout, removeFavorite } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Check user and authorization status
  useEffect(() => {
    if (!authLoading) {
      if (!token || !user) {
        setError("No active session. Please log in."); // Aktif oturum yok. Lütfen giriş yapın.
        // navigate('/login'); // Optional: redirect to login page if no token
        return;
      }
      setError(""); // Clear error if no error
    }
  }, [authLoading, token, user]);

  // Remove Favorite Pokémon action
  const handleRemoveFavorite = async (pokemonId, pokemonName) => {
    try {
      await removeFavorite(pokemonId); // Call removeFavorite function
      setSnackbarMessage(`${pokemonName} successfully removed from favorites.`); // favorilerden başarıyla silindi.
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error removing favorite:", err); // Favori silinirken hata:
      const errorMessage = err.response?.data?.error || err.message || "An error occurred while removing favorite."; // Favori silinirken bir hata oluştu.
      setSnackbarMessage(`Error: ${errorMessage}`); // Hata:
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Snackbar close action
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Check loading status
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading favorites...</Typography> {/* Favoriler yükleniyor... */}
      </Box>
    );
  }

  // Check error status
  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 10, p: 4, textAlign: "center", bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
        <Typography color="error" variant="h6" gutterBottom>{error}</Typography>
        <Button variant="contained" onClick={() => navigate('/login')} sx={{ mt: 2 }}>
            Log In
        </Button> {/* Giriş Yap */}
      </Box>
    );
  }

  // If no user information (but no error)
  if (!user) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Typography variant="h6">You must log in to see your favorites list.</Typography> {/* Favori listenizi görmek için giriş yapmalısınız. */}
            <Button variant="contained" onClick={() => navigate('/login')} sx={{ mt: 2, ml: 2 }}>
                Log In
            </Button> {/* Giriş Yap */}
        </Box>
    );
  }

  // Successful display of the Favorites page
  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        mt: 10,
        p: 4,
        boxShadow: 3,
        borderRadius: 3,
        backgroundColor: "rgba(255,255,255,0.9)",
        textAlign: "center",
        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(50, 50, 50, 0.9)' : 'rgba(255,255,255,0.9)',
        color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : 'inherit',
        transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
      }}
    >
      <Typography variant="h4" gutterBottom>
        Your Favorite Pokémon
      </Typography> {/* Favori Pokémon'ların */}

      {user.favorites && user.favorites.length > 0 ? (
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', mx: 'auto', borderRadius: '8px', boxShadow: 1,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#424242' : 'background.paper',
            color: (theme) => theme.palette.mode === 'dark' ? '#e0e0e0' : 'inherit',
            transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
        }}>
          {user.favorites.map((pokemon, index) => (
            <React.Fragment key={pokemon.pokemonId}>
              <ListItem
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveFavorite(pokemon.pokemonId, pokemon.pokemonName)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={pokemon.pokemonName}
                  primaryTypographyProps={{ textTransform: 'capitalize' }}
                />
              </ListItem>
              {index < user.favorites.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      ) : (
        <Typography variant="body1" color="text.secondary">
          You don't have any favorite Pokémon yet. You can add them from the Pokémon list!
        </Typography> /* Henüz favori Pokémon'un yok. Pokémon listesinden ekleyebilirsin! */
      )}

      {/* Optional: Back or go to another page button */}
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/pokemons')}
        sx={{ mt: 4 }}
      >
        Go Back to Pokémon List
      </Button> {/* Pokémon Listesine Geri Dön */}

      {/* Snackbar component */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%', borderRadius: '8px', boxShadow: 3 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleSnackbarClose}
            >
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

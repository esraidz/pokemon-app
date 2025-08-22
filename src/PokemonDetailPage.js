import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button, // Keep button import, maybe another button will be added later
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import { keyframes } from '@mui/system'; // For keyframes
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CloseIcon from '@mui/icons-material/Close'; // Moved import to correct source
import PokemonService from './PokemonService';
import { useTheme } from "./ThemeContext";
import { useAuth } from "./context/AuthContext";

// Keyframes for heart animation
const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
`;

function PokemonDetailPage({ pokemonName, onBack }) {
  const [pokemonDetail, setPokemonDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [isPulsing, setIsPulsing] = useState(false); // Animation trigger

  const { isDarkMode } = useTheme();
  const { user, token, addFavorite, removeFavorite } = useAuth();

  const isFavorite = user && user.favorites && pokemonDetail
    ? user.favorites.some(fav => fav.pokemonId === pokemonDetail.id)
    : false;

  useEffect(() => {
    if (pokemonName) {
      setLoading(true);
      PokemonService.getPokemonDetail(pokemonName.toLowerCase())
        .then(data => {
          setPokemonDetail(data);
          setLoading(false);
        })
        .catch(error => {
          console.error("Error fetching Pokemon detail:", error);
          setPokemonDetail(null);
          setLoading(false);
        });
    }
  }, [pokemonName]);

  const triggerPulseAnimation = () => {
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 300); // Adjust according to animation duration
  };

  const handleAddFavorite = async () => {
    if (!token) {
      setSnackbarMessage("Please log in to add to favorites.");
      setSnackbarSeverity("info");
      setSnackbarOpen(true);
      return;
    }
    if (!pokemonDetail) return;

    try {
      // NEW: We are sending pokemonDetail.image to the addFavorite function
      await addFavorite({
        pokemonId: pokemonDetail.id,
        pokemonName: pokemonDetail.name,
        image: pokemonDetail.image // Added image URL
      });
      setSnackbarMessage(`${pokemonDetail.name} added to your favorites!`);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      triggerPulseAnimation(); // Trigger animation on successful addition
    } catch (error) {
      console.error("Error adding favorite:", error);
      setSnackbarMessage(`An error occurred while adding to favorites: ${error.message}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleRemoveFavorite = async () => {
    if (!token) {
      setSnackbarMessage("Please log in to remove from favorites.");
      setSnackbarSeverity("info");
      setSnackbarOpen(true);
      return;
    }
    if (!pokemonDetail) return;

    try {
      await removeFavorite(pokemonDetail.id);
      setSnackbarMessage(`${pokemonDetail.name} removed from your favorites.`);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      triggerPulseAnimation(); // Trigger animation on successful removal
    } catch (error) {
      console.error("Error removing favorite:", error);
      setSnackbarMessage(`An error occurred while removing from favorites: ${error.message}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Pokemon details...</Typography>
      </Box>
    );
  }

  if (!pokemonDetail) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5" color="error">Pokemon details not found.</Typography>
        <Typography variant="body1">Please go back and select another Pokemon.</Typography>
      </Box>
    );
  }

  const renderStats = (stats) => (
    <List dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      {stats.map((stat, index) => (
        <React.Fragment key={stat.stat.name}>
          <ListItem>
            <ListItemText
              primary={<Typography variant="subtitle1" sx={{ textTransform: 'capitalize', color: 'text.primary' }}>{stat.stat.name}:</Typography>}
              secondary={<Typography variant="body1" sx={{ color: 'text.secondary' }}>{stat.base_stat}</Typography>}
            />
            <Box sx={{ width: '100px', height: '8px', borderRadius: '4px', backgroundColor: isDarkMode ? '#4a5568' : '#e0e0e0', overflow: 'hidden' }}>
              <Box sx={{
                width: `${Math.min(stat.base_stat / 150 * 100, 100)}%`,
                height: '100%',
                backgroundColor: isDarkMode ? '#90caf9' : '#1976d2',
                borderRadius: '4px',
                transition: 'width 0.5s ease-out',
              }} />
            </Box>
          </ListItem>
          {index < stats.length - 1 && <Divider component="li" />}
        </React.Fragment>
      ))}
    </List>
  );

  const renderAbilities = (abilities) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
      {abilities.map((ability, index) => (
        <Chip
          key={index}
          label={ability.ability.name.replace('-', ' ')}
          sx={{
            textTransform: 'capitalize',
            transition: 'background-color 0.3s ease-in-out',
            backgroundColor: isDarkMode ? '#4a5568' : '#e0e0e0',
            color: isDarkMode ? '#e2e8f0' : '#2d3748'
          }}
        />
      ))}
    </Box>
  );

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        m: { xs: 1, sm: 2 },
        maxWidth: 800,
        mx: 'auto',
        mt: { xs: 2, sm: 4 },
        backgroundColor: 'background.paper',
        color: 'text.primary',
        transition: 'background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
      }}
    >
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} sm={6} sx={{ textAlign: 'center' }}>
          <Box
            component="img"
            src={pokemonDetail.image || 'https://placehold.co/200x200/f0f0f0/cccccc?text=No+Image'}
            alt={pokemonDetail.name}
            sx={{
              width: { xs: 150, sm: 200 },
              height: { xs: 150, sm: 200 },
              objectFit: 'contain',
              filter: isDarkMode ? 'brightness(1.1)' : 'none',
              transition: 'filter 0.3s ease-in-out',
            }}
          />
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ textTransform: 'capitalize', color: 'text.primary', transition: 'color 0.3s ease-in-out' }}
          >
            {pokemonDetail.name}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {pokemonDetail.types.map((type, i) => (
              <Chip key={i} label={type} sx={{
                textTransform: 'capitalize',
                backgroundColor: isDarkMode ? '#5a6b82' : '#d1c4e9', color: isDarkMode ? '#e2e8f0' : '#311b92',
                transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out'
              }} />
            ))}
          </Box>
          {/* Favorite button, with only heart icon and red color, animated */}
          {user && ( // Show button if user is logged in
            <IconButton
              aria-label={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              onClick={isFavorite ? handleRemoveFavorite : handleAddFavorite}
              sx={{
                mt: 2,
                color: '#e53935', // Permanent red color
                '&:hover': {
                  color: '#b71c1c', // Darker red on hover
                },
                // Apply pulse animation when triggered
                animation: isPulsing ? `${pulse} 0.3s ease-in-out` : 'none',
              }}
            >
              {isFavorite ? <FavoriteIcon fontSize="large" /> : <FavoriteBorderIcon fontSize="large" />}
            </IconButton>
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
            Basic Statistics:
          </Typography>
          {renderStats(pokemonDetail.stats)}

          <Typography variant="h6" sx={{ mt: 3, color: 'text.primary' }}>
            Abilities:
          </Typography>
          {renderAbilities(pokemonDetail.abilities)}

          <Typography variant="h6" sx={{ mt: 3, color: 'text.primary' }}>
            Height: <Typography component="span" sx={{ color: 'text.secondary' }}>{pokemonDetail.height / 10} m</Typography>
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.primary' }}>
            Weight: <Typography component="span" sx={{ color: 'text.secondary' }}>{pokemonDetail.weight / 10} kg</Typography>
          </Typography>
        </Grid>
      </Grid>
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
    </Paper>
  );
}

export default PokemonDetailPage;

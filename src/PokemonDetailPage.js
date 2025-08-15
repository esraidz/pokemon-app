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
} from '@mui/material';
import PokemonService from './PokemonService'; 
import { useTheme } from "./ThemeContext"; 

function PokemonDetailPage({ pokemonName, onBack }) {
  const [pokemonDetail, setPokemonDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useTheme();

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Pokemon detayları yükleniyor...</Typography>
      </Box>
    );
  }

  if (!pokemonDetail) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5" color="error">Pokemon detayları bulunamadı.</Typography>
        <Typography variant="body1">Lütfen geri dönüp başka bir Pokemon seçin.</Typography>
        {/* onBack butonu App.js tarafından sağlanacak */}
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
                width: `${Math.min(stat.base_stat / 150 * 100, 100)}%`, // Max 150 olarak düşündük
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
          sx={{ textTransform: 'capitalize', transition: 'background-color 0.3s ease-in-out', 
                backgroundColor: isDarkMode ? '#4a5568' : '#e0e0e0', color: isDarkMode ? '#e2e8f0' : '#2d3748' }} 
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
              filter: isDarkMode ? 'brightness(1.1)' : 'none', // Koyu modda resmi biraz aydınlat
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
              <Chip key={i} label={type} sx={{ textTransform: 'capitalize', 
              backgroundColor: isDarkMode ? '#5a6b82' : '#d1c4e9', color: isDarkMode ? '#e2e8f0' : '#311b92',
              transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out'
              }} />
            ))}
          </Box>
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
        </Grid>
      </Grid>
    </Paper>
  );
}

export default PokemonDetailPage;

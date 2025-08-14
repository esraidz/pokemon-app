import React, { useEffect, useState, useCallback } from "react";
import PokemonService from "./PokemonService";
import { useTheme } from "./ThemeContext";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Chip,
  Box,
  Skeleton,
  IconButton,
  AppBar,
  Toolbar,
  CssBaseline,
  TextField, 
  Autocomplete, 
  CircularProgress, 
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";

function App() {
  const [pokemons, setPokemons] = useState([]); 
  const [displayedPokemons, setDisplayedPokemons] = useState([]); 
  const [loading, setLoading] = useState(true);
  const { isDarkMode, toggleTheme } = useTheme();

  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [allPokemonNames, setAllPokemonNames] = useState([]); 

  
  useEffect(() => {
    
    PokemonService.getAllPokemonNames()
      .then((data) => {
        setAllPokemonNames(data);
      })
      .catch((error) => console.error("Error fetching all Pokémon names:", error));

    
    setLoading(true);
    PokemonService.getPokemons(100)
      .then((data) => {
        setPokemons(data); 
        setDisplayedPokemons(data); 
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []); 

  
  const handleSearchInputChange = useCallback(
    async (event, value, reason) => {
      setSearchTerm(value); 

      if (reason === 'input' && value.length >= 2) { 
        setSearchLoading(true);
        
        const filteredNames = allPokemonNames.filter(name =>
          name.toLowerCase().includes(value.toLowerCase())
        );
        setSearchResults(filteredNames);
        setSearchLoading(false);
      } else if (reason === 'clear') {
        setSearchResults([]); 
      }
    },
    [allPokemonNames]
  );

  
  const handleSearchSelect = useCallback(
    async (event, value) => {
      if (value) { 
        const foundPokemon = pokemons.find(
          (pokemon) => pokemon.name.toLowerCase() === value.toLowerCase()
        );

        if (foundPokemon) {
          
          setDisplayedPokemons([foundPokemon]);
        } else {
          
          setLoading(true);
          try {
            const detail = await PokemonService.getPokemonDetail(value.toLowerCase()); // PokemonService'e bu metodu ekleyeceğiz
            if (detail) {
              setDisplayedPokemons([detail]);
            } else {
              setDisplayedPokemons([]); 
            }
          } catch (error) {
            console.error("Error fetching searched Pokémon detail:", error);
            setDisplayedPokemons([]);
          } finally {
            setLoading(false);
          }
        }
      } else {
        
        setDisplayedPokemons(pokemons);
      }
    },
    [pokemons] 
  );

  const cardStyles = {
    maxWidth: { xs: 280, sm: 320, md: 345 },
    margin: "auto",
    boxShadow: 3,
    transition: "transform 0.2s",
    "&:hover": { transform: { xs: "scale(1.02)", sm: "scale(1.05)" } }
  };

  const mediaStyles = {
    objectFit: "contain",
    backgroundColor: isDarkMode ? "#2d2d2d" : "#f0f0f0",
    height: { xs: 120, sm: 140 }
  };

  const chipStyles = {
    textTransform: "capitalize",
    fontSize: { xs: "0.7rem", sm: "0.8rem" },
    height: { xs: 24, sm: 32 },
    "& .MuiChip-label": {
      fontSize: { xs: "0.7rem", sm: "0.8rem" },
      px: { xs: 1, sm: 1.5 }
    }
  };

  const skeletonCount = 100;

  return (
    <>
      <CssBaseline />
      
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" component="div">
            Pokemon Collection
          </Typography>
          
          <Autocomplete
            freeSolo 
            options={searchResults}
            loading={searchLoading}
            onInputChange={handleSearchInputChange} 
            onChange={handleSearchSelect} 
            value={searchTerm} 
            onBlur={() => { // 
                if (!searchTerm && !loading) {
                    setDisplayedPokemons(pokemons);
                }
            }}
            sx={{ width: { xs: '150px', sm: '200px', md: '250px' } }} 
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Pokemon..."
                variant="outlined"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: isDarkMode ? '#A7D7FA' : '#1976D2',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: isDarkMode ? '#A7D7FA' : '#1976D2',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: isDarkMode ? '#E0E0E0' : '#333333',
                  },
                  '& .MuiInputBase-input': {
                    color: isDarkMode ? '#E0E0E0' : '#333333',
                  },
                }}
              />
            )}
          />

          <IconButton 
            color="inherit" 
            onClick={toggleTheme}
            title={isDarkMode ? "Light Mode" : "Dark Mode"}
          >
            {isDarkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ padding: { xs: 1, sm: 2, md: 3 } }}>
        <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} justifyContent="center">
          {loading
            ? Array.from(new Array(skeletonCount)).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} lg={2} xl={2} key={index}>
                  <Card sx={{ ...cardStyles, p: { xs: 0.5, sm: 1 } }}>
                    <Skeleton variant="rectangular" sx={mediaStyles} />
                    <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                      <Skeleton height={{ xs: 25, sm: 30 }} width="80%" sx={{ mb: 1 }} />
                      <Skeleton height={{ xs: 18, sm: 20 }} width="60%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            : displayedPokemons.map((pokemon, index) => ( 
                <Grid item xs={12} sm={6} md={4} lg={2} xl={2} key={index}>
                  <Card sx={cardStyles}>
                    <CardMedia
                      component="img"
                      alt={pokemon.name}
                      height="140"
                      image={pokemon.image}
                      sx={mediaStyles}
                    />
                    <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                      <Typography
                        gutterBottom
                        variant="h5"
                        component="div"
                        sx={{
                          textTransform: "capitalize",
                          fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" }
                        }}
                      >
                        {pokemon.name}
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 0.5, sm: 1 } }}>
                        {pokemon.types.map((type, i) => (
                          <Chip key={i} label={type} sx={chipStyles} />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
        </Grid>
      </Box>
    </>
  );
}

export default App;

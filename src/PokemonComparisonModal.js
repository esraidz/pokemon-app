import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { CompareArrows, Clear } from '@mui/icons-material';
import PokemonService from './PokemonService';
import { useTheme } from './ThemeContext';

function PokemonComparisonModal({ isOpen, onClose, allPokemonNames }) {
  const [pokemon1, setPokemon1] = useState(null);
  const [pokemon2, setPokemon2] = useState(null);

  const [pokemon1InputValue, setPokemon1InputValue] = useState('');
  const [pokemon2InputValue, setPokemon2InputValue] = useState('');

  const [selectedPokemon1Name, setSelectedPokemon1Name] = useState(null);
  const [selectedPokemon2Name, setSelectedPokemon2Name] = useState(null);

  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const [typeDamageRelations, setTypeDamageRelations] = useState({});
  const [fetchingTypeRelations, setFetchingTypeRelations] = useState(false);

  const { isDarkMode, theme } = useTheme();

  const typeColors = {
    normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
    grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
    ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
    rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', steel: '#B7B7CE',
    fairy: '#D685AD', dark: '#705746',
  };

  const debounceTimeoutRef = useRef(null); 

  const handlePokemon1InputChange = useCallback((event, value, reason) => {
    if (reason === 'input' || reason === 'clear') {
      setPokemon1InputValue(value);
      if (reason === 'clear') {
        setSelectedPokemon1Name(null);
      }
    }
  }, []);

  const handlePokemon2InputChange = useCallback((event, value, reason) => {
    if (reason === 'input' || reason === 'clear') {
      setPokemon2InputValue(value);
      if (reason === 'clear') {
        setSelectedPokemon2Name(null);
      }
    }
  }, []);

  const handlePokemon1Select = useCallback(async (event, value) => {
    if (!value) {
      setSelectedPokemon1Name(null);
      setPokemon1(null);
      return;
    }
    if (pokemon1 && pokemon1.name === value) return;

    setSelectedPokemon1Name(value);
  }, [pokemon1]);

  const handlePokemon2Select = useCallback(async (event, value) => {
    if (!value) {
      setSelectedPokemon2Name(null);
      setPokemon2(null);
      return;
    }
    if (pokemon2 && pokemon2.name === value) return;

    setSelectedPokemon2Name(value);
  }, [pokemon2]);

  useEffect(() => {
    if (selectedPokemon1Name) {
      setLoading1(true);
      PokemonService.getPokemonDetail(selectedPokemon1Name.toLowerCase())
        .then(data => {
          setPokemon1(data);
          setLoading1(false);
        })
        .catch(error => {
          console.error("Error fetching Pokemon 1 detail:", error);
          setPokemon1(null);
          setLoading1(false);
        });
    } else {
      setPokemon1(null);
    }
  }, [selectedPokemon1Name]);

  useEffect(() => {
    if (selectedPokemon2Name) {
      setLoading2(true);
      PokemonService.getPokemonDetail(selectedPokemon2Name.toLowerCase())
        .then(data => {
          setPokemon2(data);
          setLoading2(false);
        })
        .catch(error => {
          console.error("Error fetching Pokemon 2 detail:", error);
          setPokemon2(null);
          setLoading2(false);
        });
    } else {
      setPokemon2(null);
    }
  }, [selectedPokemon2Name]);

  useEffect(() => {
    const fetchRelations = async (pokemon) => {
      if (!pokemon || !pokemon.types) return;

      setFetchingTypeRelations(true);
      const newRelations = { ...typeDamageRelations };
      let anyNew = false;

      for (const type of pokemon.types) {
        if (!newRelations[type.toLowerCase()]) {
          const relations = await PokemonService.getTypeDamageRelations(type);
          if (relations) {
            newRelations[type.toLowerCase()] = relations;
            anyNew = true;
          }
        }
      }
      if (anyNew) {
        setTypeDamageRelations(newRelations);
      }
      setFetchingTypeRelations(false);
    };

    fetchRelations(pokemon1);
    fetchRelations(pokemon2);
  }, [pokemon1, pokemon2]);

  const handleClose = useCallback(() => {
    setPokemon1(null);
    setPokemon2(null);
    setSelectedPokemon1Name(null);
    setSelectedPokemon2Name(null);
    setPokemon1InputValue('');
    setPokemon2InputValue('');
    setTypeDamageRelations({});
    setGptComment('Select two Pokémon for the battle ');
    onClose();
  }, [onClose]);

  const comparisonCardStyles = {
    flexGrow: 1,
    maxWidth: { xs: '100%', sm: '48%' },
    minWidth: '280px',
    margin: 'auto',
    boxShadow: 3,
    backgroundColor: 'background.paper',
    color: 'text.primary',
    transition: 'background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  };

  const comparisonMediaStyles = {
    objectFit: 'contain',
    height: 140,
    backgroundColor: isDarkMode ? '#2d2d2d' : '#f0f0f0',
  };

  const comparisonChipStyles = {
    textTransform: 'capitalize',
    fontSize: '0.8rem',
    height: 28,
    '& .MuiChip-label': {
      fontSize: '0.8rem',
    },
  };

  const getStatColor = (statValue, otherStatValue) => {
    if (otherStatValue === undefined || otherStatValue === null) return 'text.primary';
    if (statValue > otherStatValue) return theme.palette.success.main;
    if (statValue < otherStatValue) return theme.palette.error.main;
    return 'text.primary';
  };

  const renderStats = (stats, otherPokemonStats) => {
    if (!stats) return null;

    const otherStatsMap = otherPokemonStats ? otherPokemonStats.reduce((acc, s) => {
      acc[s.stat.name] = s.base_stat;
      return acc;
    }, {}) : {};

    return (
      <List dense sx={{ width: '100%', bgcolor: 'transparent', p: 0 }}>
        {stats.map((stat, index) => (
          <React.Fragment key={stat.stat.name}>
            <ListItem sx={{ py: 0.5 }}>
              <ListItemText
                primary={<Typography variant="subtitle2" sx={{ textTransform: 'capitalize', color: 'text.primary' }}>{stat.stat.name}:</Typography>}
                secondary={<Typography variant="body2" sx={{ color: getStatColor(stat.base_stat, otherStatsMap[stat.stat.name]) }}>{stat.base_stat}</Typography>}
              />
              <Box sx={{ width: '80px', height: '6px', borderRadius: '3px', backgroundColor: isDarkMode ? '#4a5568' : '#e0e0e0', overflow: 'hidden' }}>
                <Box sx={{
                  width: `${Math.min(stat.base_stat / 150 * 100, 100)}%`,
                  height: '100%',
                  backgroundColor: getStatColor(stat.base_stat, otherStatsMap[stat.stat.name]),
                  borderRadius: '3px',
                  transition: 'width 0.5s ease-out, background-color 0.3s ease-in-out',
                }} />
              </Box>
            </ListItem>
            {index < stats.length - 1 && <Divider component="li" sx={{ borderColor: 'divider' }} />}
          </React.Fragment>
        ))}
      </List>
    );
  };

  const renderAbilities = (abilities) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
      {abilities && abilities.map((ability, index) => (
        <Chip 
          key={index} 
          label={ability.ability.name.replace('-', ' ')} 
          size="small"
          sx={{ textTransform: 'capitalize', 
                backgroundColor: isDarkMode ? theme.palette.grey[700] : theme.palette.grey[300],
                color: isDarkMode ? theme.palette.grey[100] : theme.palette.grey[900],
                transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
              }} 
        />
      ))}
    </Box>
  );

  const getTypeColor = useCallback((currentType, targetPokemonTypes) => {
    if (!currentType || !targetPokemonTypes || targetPokemonTypes.length === 0 || !typeDamageRelations[currentType.toLowerCase()]) {
        return 'text.primary';
    }

    const currentTypeRelations = typeDamageRelations[currentType.toLowerCase()];
    let hasAdvantage = false;
    let hasDisadvantage = false;

    for (const targetType of targetPokemonTypes) {
        if (currentTypeRelations.double_damage_to && currentTypeRelations.double_damage_to.some(rel => rel.name === targetType.toLowerCase())) {
            hasAdvantage = true;
        }
        if (currentTypeRelations.double_damage_from && currentTypeRelations.double_damage_from.some(rel => rel.name === targetType.toLowerCase())) {
            hasDisadvantage = true;
        }
        if (currentTypeRelations.no_damage_to && currentTypeRelations.no_damage_to.some(rel => rel.name === targetType.toLowerCase())) {
            return theme.palette.error.main;
        }
        if (currentTypeRelations.no_damage_from && currentTypeRelations.no_damage_from.some(rel => rel.name === targetType.toLowerCase())) {
            return theme.palette.success.main;
        }
    }

    if (hasAdvantage && hasDisadvantage) return theme.palette.warning.main;
    if (hasAdvantage) return theme.palette.success.main;
    if (hasDisadvantage) return theme.palette.error.main;
    
    return 'text.primary';
  }, [typeDamageRelations, theme]);


  const [gptComment, setGptComment] = useState('Karşılaştırma analizi için  seçiniz.');
  const [gptLoading, setGptLoading] = useState(false);

  const callGeminiApiWithBackoff = useCallback(async (prompt, retries = 0) => {
    const maxRetries = 5;
    const baseDelay = 1000; // 1 saniye

    try {
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistory };
        
        // API anahtarı Canvas ortamı tarafından sağlanacak
        const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`Gemini API error (${response.status}):`, errorData);
            if (response.status === 403 && retries < maxRetries) {
                const delay = baseDelay * Math.pow(2, retries);
                console.warn(`Retrying Gemini API call in ${delay / 1000} seconds... (Attempt ${retries + 1})`);
                await new Promise(res => setTimeout(res, delay));
                return callGeminiApiWithBackoff(prompt, retries + 1);
            } else {
                throw new Error(`API returned status ${response.status}: ${JSON.stringify(errorData)}`);
            }
        }

        const result = await response.json();
        
        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
            return result.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Invalid response structure from Gemini API');
        }
    } catch (error) {
        console.error("Error calling Gemini API (final):", error);
        throw error;
    }
  }, []);


  const getGptComparisonComment = useCallback(async () => {
    if (!pokemon1 || !pokemon2) {
      setGptComment('Lütfen iki Pokemon seçiniz.');
      return;
    }
    setGptLoading(true);
    setGptComment('Pokemonlar karşılaştırılıyor, lütfen bekleyiniz...');

    try {
        const prompt = `Analyze the differences between "${pokemon1.name}" (types: ${pokemon1.types.join(', ')}, stats: ${JSON.stringify(pokemon1.stats)}) and "${pokemon2.name}" (types: ${pokemon2.types.join(', ')}, stats: ${JSON.stringify(pokemon2.stats)}) in a Pokemon battle. Determine who might have an advantage and why, based on their types, base stats (HP, Attack, Defense, Special-Attack, Special-Defense, Speed), and abilities. Provide a concise summary.`;
        
        const comment = await callGeminiApiWithBackoff(prompt);
        setGptComment(comment);
    } catch (error) {
        setGptComment('Analiz sırasında bir hata oluştu. Lütfen konsolu kontrol edin.');
    } finally {
        setGptLoading(false);
    }
  }, [pokemon1, pokemon2, callGeminiApiWithBackoff]);

  useEffect(() => {
    if (pokemon1 && pokemon2) {
      getGptComparisonComment();
    } else {
      setGptComment('Select two Pokémon for the battle');
    }
  }, [pokemon1, pokemon2, getGptComparisonComment]);

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         Compare Pokémons
        <IconButton onClick={handleClose} size="small">
          <Clear />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
          {/* Pokemon 1 Seçimi */}
          <Box sx={{ flex: 1 }}>
            <Autocomplete
              options={allPokemonNames}
              onInputChange={(event, newInputValue) => {
                setPokemon1InputValue(newInputValue);
              }}
              onChange={(event, newValue) => {
                setSelectedPokemon1Name(newValue);
              }}
              loading={loading1}
              value={selectedPokemon1Name}
              inputValue={pokemon1InputValue}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Choose your first pokémon"
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {(loading1 || fetchingTypeRelations) ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Box>
          {/* Pokemon 2 Seçimi */}
          <Box sx={{ flex: 1 }}>
            <Autocomplete
              options={allPokemonNames}
              onInputChange={(event, newInputValue) => {
                setPokemon2InputValue(newInputValue);
              }}
              onChange={(event, newValue) => {
                setSelectedPokemon2Name(newValue);
              } }
              loading={loading2}
              value={selectedPokemon2Name}
              inputValue={pokemon2InputValue}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Choose the second pokémon"
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {(loading2 || fetchingTypeRelations) ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', alignItems: 'stretch' }}>
          {/* Pokemon 1 Kartı */}
          {pokemon1 ? (
            <Card sx={comparisonCardStyles}>
              <CardMedia
                component="img"
                alt={pokemon1.name}
                height="140"
                image={pokemon1.image}
                sx={comparisonMediaStyles}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="div" sx={{ textTransform: 'capitalize' }}>
                  {pokemon1.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                  Height: {pokemon1.height / 10} m, Weight: {pokemon1.weight / 10} kg
                </Typography>
                
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.primary' }}>Type:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {pokemon1.types.map((type, i) => (
                    <Chip
                      key={i}
                      label={type}
                      sx={{
                        ...comparisonChipStyles,
                        backgroundColor: typeColors[type.toLowerCase()] || (isDarkMode ? theme.palette.grey[700] : theme.palette.grey[300]),
                        color: pokemon2 ? getTypeColor(type, pokemon2.types) : (isDarkMode ? theme.palette.grey[100] : theme.palette.grey[900]),
                      }}
                    />
                  ))}
                </Box>

                <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.primary' }}>Statistics:</Typography>
                {renderStats(pokemon1.stats, pokemon2 ? pokemon2.stats : null)}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, color: 'text.primary' }}>Abilities:</Typography>
                {renderAbilities(pokemon1.abilities)}

              </CardContent>
            </Card>
          ) : (
            <Paper sx={{ ...comparisonCardStyles, p: 2, textAlign: 'center', minHeight: 450, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="text.secondary">Choose your first pokémon</Typography>
            </Paper>
          )}

          {/* Pokemon 2 Kartı */}
          {pokemon2 ? (
            <Card sx={comparisonCardStyles}>
              <CardMedia
                component="img"
                alt={pokemon2.name}
                height="140"
                image={pokemon2.image}
                sx={comparisonMediaStyles}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="div" sx={{ textTransform: 'capitalize' }}>
                  {pokemon2.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                   Height: {pokemon2.height / 10} m, Weight: {pokemon2.weight / 10} kg
                </Typography>

                <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.primary' }}>Type:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {pokemon2.types.map((type, i) => (
                    <Chip
                      key={i}
                      label={type}
                      sx={{
                        ...comparisonChipStyles,
                        backgroundColor: typeColors[type.toLowerCase()] || (isDarkMode ? theme.palette.grey[700] : theme.palette.grey[300]),
                        color: pokemon1 ? getTypeColor(type, pokemon1.types) : (isDarkMode ? theme.palette.grey[100] : theme.palette.grey[900]),
                      }}
                    />
                  ))}
                </Box>

                <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.primary' }}>Statistics:</Typography>
                {renderStats(pokemon2.stats, pokemon1 ? pokemon1.stats : null)}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, color: 'text.primary' }}>Abilities:</Typography>
                {renderAbilities(pokemon2.abilities)}

              </CardContent>
            </Card>
          ) : (
            <Paper sx={{ ...comparisonCardStyles, p: 2, textAlign: 'center', minHeight: 450, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="text.secondary">Choose the second pokémon</Typography>
            </Paper>
          )}
        </Box>

        {/* GPT Karşılaştırma Yorumu */}
        <Box sx={{ mt: 4, p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
          Comparison analysis:
          </Typography>
          {gptLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{gptComment}</Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default PokemonComparisonModal;



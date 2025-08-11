import React, { useEffect, useState } from "react";
import PokemonService from "./PokemonService";
import { Card, CardContent, CardMedia, Typography, Grid, Chip } from "@mui/material";

function App() {
  const [pokemons, setPokemons] = useState([]);

  useEffect(() => {
    PokemonService.getPokemons(100).then(setPokemons);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <Grid container spacing={2}>
        {pokemons.map((pokemon, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card sx={{ maxWidth: 345, boxShadow: 3 }}>
              <CardMedia
                component="img"
                alt={pokemon.name}
                height="140"
                image={pokemon.image}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {pokemon.name.toUpperCase()}
                </Typography>
                <div>
                  {pokemon.types.map((type, i) => (
                    <Chip key={i} label={type} style={{ marginRight: 5 }} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default App;
import axios from "axios";
import Pokemon from "./Pokemon"; 

export default class PokemonService {
  static async getPokemons(limit = 100) {
    try {
      const res = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
      const results = res.data.results;

      const pokemons = await Promise.all(
        results.map(async (poke) => {
          const details = await axios.get(poke.url);
          const data = details.data;
          return new Pokemon(
            data.name,
            data.sprites.front_default,
            data.types.map((t) => t.type.name)
          );
        })
      );

      return pokemons;
    } catch (error) {
      console.error("Pokemon data could not be retrieved", error);
      return [];
    }
  }

  static async getAllPokemonNames() {
    try {
      
      
      const res = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=2000');
      const data = res.data.results;
      
      return data.map(pokemon => pokemon.name);
    } catch (error) {
      console.error("All Pokemon names could not be retrieved", error);
      return [];
    }
  }

  
  static async getPokemonDetail(name) {
    try {
      const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
      const data = res.data;
      
      return new Pokemon(
        data.name,
        data.sprites.front_default,
        data.types.map((t) => t.type.name)
      );
    } catch (error) {
      
      console.error(`Pokemon detail for ${name} could not be retrieved:`, error);
      return null; 
    }
  }
}

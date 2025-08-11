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
}
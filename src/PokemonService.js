import axios from "axios";
import Pokemon from "./Pokemon"; 

export default class PokemonService {
  /**
   * Belirtilen limit ve offset değerlerine göre Pokemon listesini çeker.
   * Her Pokemon için detaylı bilgi alıp Pokemon sınıfı örneği olarak döndürür.
   * @param {number} limit - Kaç Pokemon çekileceği.
   * @param {number} offset - Hangi indexten itibaren çekileceği.
   * @returns {Promise<Pokemon[]>} Pokemon objelerinin listesi.
   */
  static async getPokemons(limit = 100, offset = 0) {
    try {
      const res = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
      const results = res.data.results;

      const pokemons = await Promise.all(
        results.map(async (poke) => {
          const details = await axios.get(poke.url);
          const data = details.data;
          
          return new Pokemon(
            data.id, // <-- id EKLENDİ
            data.name,
            data.sprites.other['official-artwork'].front_default || data.sprites.front_default || 'https://placehold.co/140x140/f0f0f0/cccccc?text=No+Image',
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
        data.id, // <-- id EKLENDİ
        data.name,
        data.sprites.other['official-artwork'].front_default || data.sprites.front_default || 'https://placehold.co/200x200/f0f0f0/cccccc?text=No+Image',
        data.types.map((t) => t.type.name),
        data.stats.map((s) => ({
          base_stat: s.base_stat,
          effort: s.effort,
          stat: { name: s.stat.name, url: s.stat.url },
        })),
        data.abilities.map((a) => ({
          ability: { name: a.ability.name, url: a.ability.url },
          is_hidden: a.is_hidden,
          slot: a.slot,
        })),
        data.height,
        data.weight
      );
    } catch (error) {
      console.error(`Pokemon detail for ${name} could not be retrieved:`, error);
      return null;
    }
  }

  static async getTypeDamageRelations(typeName) {
    try {
      const res = await axios.get(`https://pokeapi.co/api/v2/type/${typeName.toLowerCase()}/`);
      return res.data.damage_relations;
    } catch (error) {
      console.error(`Damage relations for type ${typeName} could not be retrieved:`, error);
      return null;
    }
  }
}
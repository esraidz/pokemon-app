const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    favorites: {
        type: [{
            pokemonId: { type: Number, required: true },   // Pokédex ID
            name: { type: String, required: true },        // Pokémon adı
            image: { type: String, required: true }        // Pokémon resmi
        }],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
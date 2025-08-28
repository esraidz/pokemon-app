const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: "" }, // yeni alan
    favorites: {
        type: [{
            pokemonId: { type: Number, required: true },   
            name: { type: String, required: true },        
            image: { type: String, required: true }        
        }],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
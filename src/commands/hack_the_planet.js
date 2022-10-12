const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("hack_the_planet")
        .setDescription("Responds with a cool hacker gif!"),
    async execute(interaction) {
       await interaction.reply("https://tenor.com/view/hack-the-planet-gif-15624885") 
    },
};
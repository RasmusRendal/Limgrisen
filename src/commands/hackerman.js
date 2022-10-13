const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("hackerman")
        .setDescription("Responds with a cool hacker gif!"),
    async execute(interaction) {
       await interaction.reply("https://media.giphy.com/media/MM0Jrc8BHKx3y/giphy.gif") 
    },
};
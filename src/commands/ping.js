const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!"),
        //.setDefaultMemberPermissions("0"), // Allowing only administrators to use command
    async execute(interaction) {
        await interaction.reply("Pong!");
    },
};
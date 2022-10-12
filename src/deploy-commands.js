const fs = require("fs");
const { SlashCommandBuilder, REST, Routes } = require("discord.js");
const { clientId, guildId, token } = require("./config.json"); 

// Getting commands from command folder
const command_folder = __dirname + "/commands";

const commands = [];
const commands_json = [];
const commandFiles = fs.readdirSync(command_folder).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(command_folder + "/" + file);
    commands.push(command);
    commands_json.push(command.data.toJSON());
}

//console.log(commands);
//console.log(commands_json);


async function deploy_commands(client) {
    const rest = new REST({ version: "10" }).setToken(token);
    const response = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands_json });
}

module.exports = { deploy_commands };
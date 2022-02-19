const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.js');

const command_folder = __dirname + '/commands';

const commands = [];
const commands_json = [];
const commandFiles = fs.readdirSync(command_folder).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(command_folder + '/' + file);
	commands.push(command);
	commands_json.push(command.data.toJSON());

}

async function deploy_commands(client) {
	const rest = new REST({ version: '9' }).setToken(token);
	const response = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands_json });

	permissions = [];
	for (let i = 0; i < response.length; i++) {
		const command = response[i];
		const name = command.name;
		const perms = commands[i].permissions;
		if (perms === undefined || perms.length == 0) {
			console.log(`No permissions to set for command ${name}`);
			continue;
		}
		const guild = await client.guilds.fetch(guildId);
		guild.commands.permissions.add({
			command: command.id,
			permissions: perms,
		}).then(console.log).catch(console.error);
	}
}

module.exports = { deploy_commands };

const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.js');

const command_folder = __dirname + '/commands'

const commands = [];
const commands_json = [];
const commandFiles = fs.readdirSync(command_folder).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(command_folder + '/' + file);
	commands.push(command);
	commands_json.push(command.data.toJSON());

}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    const response = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands_json });
    console.log("Registered commands");

    for (const command of commands) {
        const name = command.data.name;
        if (command.permissions === undefined || command.permissions.length == 0) {
            console.log(`No permissions to set for command ${name}`);
            continue;
        }
        const ext_command = response.find(cmd => cmd.name === name);

        if (ext_command === undefined) {
            throw `Could not find command ${name}`;
        }

        const permissions_body = [
            {
                id: ext_command.id,
                permissions: command.permissions
            }
        ];

        await rest.put(Routes.guildApplicationCommandsPermissions(clientId, guildId),
            { body: permissions_body },
        );
        console.log(`Set permissions for command ${name}`);
    }
})();

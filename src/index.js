const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.js');
const command_folder = __dirname + '/commands'

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', () => {
	console.log('Ready!');
});

client.commands = new Collection();
const commandFiles = fs.readdirSync(command_folder).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`${command_folder}/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
	if (!command) {
        console.log('was not a command');
        console.log(interaction);
    }

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}

});

client.on('rateLimit', async data => {
    console.log("geez, a rate limit")
    console.log(data);
});

client.login(token);

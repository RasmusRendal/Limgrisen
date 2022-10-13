const fs = require("fs");
const { token } = require("./config.json")
const command_folder = __dirname + "/commands";
const { deploy_commands } = require("./deploy-commands")

const { Client, GatewayIntentBits, Collection } = require("discord.js");
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]})

client.once('ready', async () => {
    console.log("[*] Client is running...");
    await deploy_commands(client);
})

client.commands = new Collection();
const commandFiles = fs.readdirSync(command_folder).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`${command_folder}/${file}`);

    client.commands.set(command.data.name, command);
}

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;
    
    const command = client.commands.get(interaction.commandName);
    if (!command) {
        console.log("was not a command");
        console.log(interaction)
    }

    try {
        await command.execute(interaction);
    }
    catch(error) {
        console.error(error);
        await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true});
    }
});

client.login(token);
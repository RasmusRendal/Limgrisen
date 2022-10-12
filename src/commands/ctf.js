const {guildId, clientId, activeCtfChanName, activeChallengeChanName, completedChallengeChanName } = require("../config.js");
const { SlashCommandBuilder, ChannelType, CategoryChannelChildManager, GuildChannel, GuildManager, CategoryChannel } = require("discord.js");
const { createCTF, AlreadyExistsError } = require("../func.js")

const ctfCommand = new SlashCommandBuilder()
    .setName("ctf")
    .setDescription("Add or manage CTF's")
    .setDefaultMemberPermissions("0");

ctfCommand.addSubcommand((command) =>
    command
        .setName("add")
        .setDescription("Add a CTF")
        //.setDefaultMemberPermissions("0")
        .addStringOption((option) =>
            option.setName("name").setDescription("The name of the CTF").setRequired(true),
        ),
);

module.exports = {
    data: ctfCommand,
    async execute(interaction) {
        if (interaction.options.getSubcommand() == "add") {
            const name = interaction.options.getString("name");
            try {
                await createCTF(interaction.member.guild, name);
            }
            catch (err) {
                if (err instanceof AlreadyExistsError) {
                    return await interaction.reply(`CTF ${name} already exists!`);
                }
                return await interaction.reply("An unknown error occured.");
            }
            return await interaction.reply(`CTF ${name} successfully added.`);
        }
        else {
            throw `Unknown subcommand ${interaction.options.getSubcommand()}`;
        }
    },
};
const { SlashCommandBuilder } = require('@discordjs/builders');
const { getCtfNameFromChannelId, createChallenge, markChallengeAsDone, AlreadyExistsError } = require("../ctf.js");

const challengeCommand = new SlashCommandBuilder().setName('challenge').setDescription('Add or manage challenges');

challengeCommand.addSubcommand((command) =>
    command
    .setName("add")
    .setDescription("Add a challenge to a CTF")
    .addStringOption((option) =>
        option.setName('name').setDescription('The name of the challenge').setRequired(true),
    )
);

challengeCommand.addSubcommand((command) =>
    command
    .setName("done")
    .setDescription("Mark a challenge as done")
);


module.exports = {
    data: challengeCommand,
    async execute(interaction) {
        const guild = interaction.member.guild;
        if (interaction.options.getSubcommand() === 'add') {
            let challengeName = interaction.options.getString('name');
            let ctf = await getCtfNameFromChannelId(guild, interaction.channelId);
            if (ctf == undefined) {
                return await interaction.reply("⚠️ This command must be called from a CTF channel");
            }
            try {
                await createChallenge(guild, ctf, challengeName);
                return await interaction.reply("Challenge channel added");
            } catch (e) {
                if (e instanceof AlreadyExistsError) {
                    return await interaction.reply("⚠️ This challenge already exists");
                } else {
                    throw e;
                }
            }
        } else if (interaction.options.getSubcommand() === 'done') {
            const res = await markChallengeAsDone(guild, interaction.channelId);
            if (res) {
                return await interaction.reply("Challenge marked as done :tada");
            } else {
                return await interaction.reply("You must be in a challenge channel to execute this command");
            }
        }
        throw "Should not be hit";
    },
}

const { SlashCommandBuilder, MessageMentions: { users }} = require("discord.js");
const { getCtfNameFromChannelId, createChallenge, markChallengeAsDone, AlreadyExistsError } = require("../func.js")

const challengeCommand = new SlashCommandBuilder()
    .setName("challenge")
    .setDescription("Add or manage challenges");

challengeCommand.addSubcommand((command) => 
    command
    .setName("add")
    .setDescription("Add a challenge to a CTF")
    .addStringOption((option) => 
        option
        .setName("name")
        .setDescription("The name of the challenge")
        .setRequired(true),
    )
);

challengeCommand.addSubcommand((command) =>
    command
    .setName("done")
    .setDescription("Mark challenge as done")
    .addStringOption(option => 
        option
        .setName("credit")
        .setDescription("Credit to those who completed the challenge")
    )
);

module.exports = {
    data: challengeCommand,
    async execute(interaction) {
        const guild = interaction.member.guild;
        if (interaction.options.getSubcommand() === "add") {
            let challengeName = interaction.options.getString("name");
            let ctf = await getCtfNameFromChannelId(guild, interaction.channelId);
            if (ctf === undefined) {
                return await interaction.reply("This command must be called from a CTF channel");
            } 
            try {
                await createChallenge(guild, ctf, challengeName);
                return await interaction.reply("Challenge channel added");
            } catch (e) {
                if (e instanceof AlreadyExistsError) {
                    return await interaction.reply("This challenge already exists");
                }
                throw e;
            }
        } else if (interaction.options.getSubcommand() === "done") {
            const res = await markChallengeAsDone(guild, interaction.channelId);
            if (!res) {
                return await interaction.reply("You must be in a challenge channel to execute this command");
            }
            const user = "<@" + interaction.user.id + ">";
            const credit = interaction.options.getString("credit");
            const chalName = interaction.channel.name.split("-").slice(1).join("-");
            let creditString = "Challenge completed by " + user + " :tada:"
            let mainCredit = `Challenge ${chalName} completed by ` + user + " :tada:"
            if (credit) {
                const others = credit.match(users);
                if (others) {
                    const usersString = user + ", " + others.input.split(" ").join(", ");
                    creditString = "Challenge completed by " + usersString + " :tada:";
                    mainCredit = `Challenge ${chalName} completed by ` + usersString + " :tada:"
                }
            } 
            let name = interaction.channel.name.split("-")[0];
            let channel = guild.channels.cache.find((c) => c.name === name);
            return await interaction.reply("**" + creditString + "**") && channel.send("**" + mainCredit + "**");
        }
        throw "Should not be hit";
    },
}
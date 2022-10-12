const { guildId, clientId, activeCtfChanName, activeChallengeChanName, completedChallengeChanName, teamMemberId } = require("./config.js");
const { SlashCommandBuilder, ChannelType, CategoryChannelChildManager, GuildChannel, GuildManager, CategoryChannel, PermissionOverwrites, InteractionCollector, PermissionFlagsBits } = require("discord.js");

class AlreadyExistsError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

async function getCategory(guild, name) {
    let channel = guild.channels.cache.find((c) => c.name === name);
    if (typeof channel !== "undefined") return channel;

    return await guild.channels.create({
        name: name, 
        type: ChannelType.GuildCategory,
    });
}

async function getCtfCategory(guild) {
    return await getCategory(guild, activeCtfChanName);
}

async function getChannelIfExists(guild, category, name) {
    return guild.channels.cache.find((c) => c.name === name);
}

async function createChannel(guild, ctfName, categoryName, channelName) {
    let category = await getCategory(guild, categoryName);
    let existingChannel = await getChannelIfExists(guild, category, channelName);
    if (existingChannel !== undefined) {
        throw new AlreadyExistsError("");
    }

    let new_channel = await guild.channels.create({name: channelName, type: ChannelType.GuildText});
    await new_channel.setParent(category, {lockPermissions: false});
    new_channel.permissionOverwrites.create(guild.roles.everyone, { ViewChannel: false });
    new_channel.permissionOverwrites.create(teamMemberId, { ViewChannel: true });

    return new_channel;
}

async function createCTF(guild, ctfName) {
    console.log(`[*] Creating ctf with name "${ctfName}"...`);
    return await createChannel(guild, ctfName, activeCtfChanName, ctfName);
}

async function getCtfNameFromChannelId(guild, channelId) {
    let category = await getCtfCategory(guild);
    let channel = guild.channels.cache.find((c) => c.id == channelId && c.parentId === category.id);
    if (channel === undefined) {
        return undefined;
    }
    return channel.name
}

async function createChallenge(guild, ctfName, challengeName) {
    return await createChannel(guild, ctfName, activeChallengeChanName, ctfName + "-" + challengeName);
}

async function markChallengeAsDone(guild, channelId) {
    let active_category = await getCategory(guild, activeChallengeChanName);
    let completed_category = await getCategory(guild, completedChallengeChanName);
    let channel = guild.channels.cache.find((c) => c.id === channelId && c.parentId === active_category.id);
    if (channel === undefined) return false;

    await channel.setParent(completed_category, {lockPermissions: false});
    return true;
}

module.exports = { createCTF, getCtfNameFromChannelId, createChallenge, markChallengeAsDone, AlreadyExistsError }
const { guildId, clientId, activectfchanname, activechallengechanname, completedchallengechanname, ctfpermissions } = require('./config.js');
const { getChannelPermissions } = require('./roles.js');
const { Permissions } = require('discord.js');

class AlreadyExistsError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

async function getCategory(guild, name) {
    let channel = guild.channels.cache.find((c) => c.name === name && c.type === "GUILD_CATEGORY" );
    if (channel !== undefined) return channel;

    return await guild.channels.create(name, {
        type: "GUILD_CATEGORY",
    });
}

async function getCtfCategory(guild) {
    return await getCategory(guild, activectfchanname);
}

async function getChannelIfExists(guild, category, name) {
    return guild.channels.cache.find((c) => c.name === name && c.type === "GUILD_TEXT" && c.parentId == category.id );
}

async function createChannel(guild, ctfname, categoryname, channelname) {
    let category = await getCategory(guild, categoryname);
    let existingChannel = await getChannelIfExists(guild, category, channelname)
    if (typeof existingChannel !== 'undefined') {
        throw new AlreadyExistsError("This channel already exists");
    }

    let permissionOverwrites = [];
    if (ctfpermissions) {
        permissionOverwrites.push({
            id: guild.id,
            deny: [Permissions.FLAGS.VIEW_CHANNEL],
        });
        const newPermissions = await getChannelPermissions(guild, ctfname);
        permissionOverwrites = permissionOverwrites.concat(newPermissions);
    }

    let new_channel = await guild.channels.create(channelname, {
        type: "GUILD_TEXT",
        permissionOverwrites: permissionOverwrites,
    });
    await new_channel.setParent(category);
    await new_channel.permissionOverwrites.set(permissionOverwrites);
    return new_channel;
}

async function createCTF(guild, ctfname) {
    return await createChannel(guild, ctfname, activectfchanname, ctfname);
}

async function getCtfNameFromChannelId(guild, channelId) {
    let category = await getCtfCategory(guild);
    let channel = guild.channels.cache.find((c) => c.id === channelId && c.type === "GUILD_TEXT" && c.parentId === category.id );
    if (channel === undefined) {
        return undefined;
    }
    return channel.name;
}

async function createChallenge(guild, ctfName, challengeName) {
    return await createChannel(guild, ctfName, activechallengechanname, ctfName + "-" + challengeName);
}

async function markChallengeAsDone(guild, channelId) {
    let active_category = await getCategory(guild, activechallengechanname);
    let completed_category = await getCategory(guild, completedchallengechanname);
    let channel = guild.channels.cache.find((c) => c.id === channelId && c.type === "GUILD_TEXT" && c.parentId === active_category.id);
    if (channel === undefined) return false;

    await channel.setParent(completed_category);
    return true;

}

module.exports = { createCTF, getCtfNameFromChannelId, createChallenge, markChallengeAsDone, AlreadyExistsError };

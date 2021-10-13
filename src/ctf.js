const { guildId, clientId, activectfchanname, activechallengechanname, completedchallengechanname } = require('../config.json');
const { CTF, Challenge } = require('./database.js');

class AlreadyExistsError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTracke(this, this.constructor);
    }
}

async function getCategory(guild, name) {
    let channels = await guild.channels.fetch();
    let channel = channels.find((c) => c.name === name && c.type === "GUILD_CATEGORY" );
    if (channel !== undefined) return channel;

    return await guild.channels.create(name, {
        type: "GUILD_CATEGORY",
    });
}

async function getCtfCategory(guild) {
    return await getCategory(guild, activectfchanname);
}

async function getChannelIfExists(guild, category, name) {
    let channels = await guild.channels.fetch();
    return channels.find((c) => c.name === name && c.type === "GUILD_TEXT" && c.parentId == category.id );
}

async function createChannel(guild, categoryname, channelname) {
    let category = await getCategory(guild, categoryname);
    if (await getChannelIfExists(guild, category, channelname) !== undefined)
        throw new AlreadyExistsError("This channel already exists");
    let new_channel = await guild.channels.create(channelname, {
        type: "GUILD_TEXT",
    });
    return await new_channel.setParent(category);
}

async function createCTF(guild, ctfname) {
    return await createChannel(guild, activectfchanname, ctfname);
}

async function getCtfNameFromChannelId(guild, channelId) {
    let category = await getCtfCategory(guild);
    let channels = await guild.channels.fetch();
    let channel = channels.find((c) => c.id === channelId && c.type === "GUILD_TEXT" && c.parentId === category.id );
    if (channel === undefined) {
        return undefined;
    }
    return channel.name;
}

async function createChallenge(guild, ctfName, challengeName) {
    return await createChannel(guild, activechallengechanname, ctfName + "-" + challengeName);
}

async function markChallengeAsDone(guild, channelId) {
    let active_category = await getCategory(guild, activechallengechanname);
    let completed_category = await getCategory(guild, completedchallengechanname);
    let channels = await guild.channels.fetch();
    let channel = channels.find((c) => c.id === channelId && c.type === "GUILD_TEXT" && c.parentId === active_category.id);
    if (channel === undefined) return false;

    await channel.setParent(completed_category);
    return true;

}

module.exports = { createCTF, getCtfNameFromChannelId, createChallenge, markChallengeAsDone, AlreadyExistsError };

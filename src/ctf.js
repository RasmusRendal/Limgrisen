const { guildId, clientId, activectfchanname } = require('../config.json');
const { CTF, Challenge } = require('./database.js');

async function getCtfCategory(guild) {
    let channels = await guild.channels.fetch();
    let channel = channels.find((c) => c.name === activectfchanname && c.type === "GUILD_CATEGORY" );
    if (channel !== undefined) return channel;

    return await guild.channels.create(activectfchanname, {
        type: "GUILD_CATEGORY",
    });
}

async function getCtfChannel(guild, name) {
    let category = await getCtfCategory(guild);
    let channels = await guild.channels.fetch();
    let channel = channels.find((c) => c.name === name && c.type === "GUILD_TEXT" && c.parentId == category.id );

    if (channel != undefined) return channel;

    let new_channel = await guild.channels.create(name, {
        type: "GUILD_TEXT",
    });
    return await new_channel.setParent(category);
}

async function createCTF(guild, ctfname) {
    //let ctf = await CTF.create({ name: ctfname });
    let ctfChannel = await getCtfChannel(guild, ctfname);
}

module.exports = { createCTF };

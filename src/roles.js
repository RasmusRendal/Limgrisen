const { teammemberrole } = require('../config.json');
const { Permissions } = require('discord.js');

async function getTeamMemberRole(guild, ctfname) {
    if (teammemberrole === "")
        return undefined;
    return teammemberrole;
}

async function getCtfRole(guild, ctfname) {
    const rolename = ctfname + " player"
    let roles = await guild.roles.fetch();
    let ctfrole = roles.find((r) => r.name === rolename);
    if (ctfrole !== undefined) return ctfrole;

    let role = await guild.roles.create({
        name: rolename
    });
    return role.id;
}

async function getChannelPermissions(guild, ctfname) {
    const allowroles = [Permissions.FLAGS.VIEW_CHANNEL];

    let overwrites = [];
    let teammemberrole = await getTeamMemberRole(guild, ctfname);
    if (teammemberrole !== undefined)
        overwrites.push({id: teammemberrole, allow: allowroles})
    overwrites.push({id: await getCtfRole(guild, ctfname), allow: allowroles});
    return overwrites;
}

module.exports = { getChannelPermissions };

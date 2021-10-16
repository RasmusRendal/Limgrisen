const { teammemberrole } = require('../config.json');
const { Permissions } = require('discord.js');

// We sort of store information in Discord channel names. But they don't support
// some characters. Spaces are also converted to dashes.
// This function translates both a discord-mangled string and a non-mangled
// string into the same string.
function normalizeRoleName(rolename) {
    return rolename.toUpperCase().replace(/ /g, '-').replace(/[']/g, "")
}

async function getTeamMemberRole(guild, ctfname) {
    if (teammemberrole === "")
        return undefined;
    return teammemberrole;
}

async function getCtfRole(guild, ctfname) {
    const rolename = ctfname + " player"
    let roles = await guild.roles.fetch();
    let ctfrole = roles.find((r) =>
        normalizeRoleName(r.name) === normalizeRoleName(rolename.toUpperCase()));
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

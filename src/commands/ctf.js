const { SlashCommandBuilder } = require('@discordjs/builders');
const { ctfadminrole } = require('../config.js');
const { createCTF, AlreadyExistsError } = require('../ctf.js');

const ctfCommand = new SlashCommandBuilder().setName('ctf').setDescription('Add or manage CTFs');

const permissions = [];
if (ctfadminrole === undefined || ctfadminrole === "") {
    console.log("No ctfadminrole is set. Now nobody will be able to create CTFs.")
} else {
    permissions.push({
        id: ctfadminrole,
        type: 2,
        permission: true,
    });
}


ctfCommand.addSubcommand((command) =>
    command
    .setName('add')
    .setDescription('Add a CTF')
    .addStringOption((option) =>
        option.setName('name').setDescription('The name of the CTF').setRequired(true),
    )
);

ctfCommand.setDefaultPermission(false);


module.exports = {
    data: ctfCommand,
    permissions: permissions,
    async execute(interaction) {
        if (interaction.options.getSubcommand() == 'add') {
            const name = interaction.options.getString('name');
            try {
                await createCTF(interaction.member.guild, name);
            } catch (err) {
                if (err instanceof AlreadyExistsError) {
                    return await interaction.reply(`CTF ${name} already exists!`);
                }
                return await interaction.reply(`An unknown error occured`);
            }
            return await interaction.reply(`CTF ${name} successfully added.`);
        } else {
            throw `Unknown subcommand ${interaction.options.getSubcommand()}`;
        }
    },
};

const channel = {
	name: 'cfs-challenge-tests',
	setParent: jest.fn(),
};

const guild = {
	channels: {
		cache: {
			find: jest.fn(),
		},
		create: jest.fn(),
	},
};

const interaction = {
	reply: jest.fn(),
	member: {
		guild: guild,
	},
	channelId: 'channel-id',
	options: {
		getSubcommand: jest.fn(),
		getString: jest.fn(),
	},
	user: {
		id: '000000000000000000',
	},
};

module.exports = { channel, guild, interaction };

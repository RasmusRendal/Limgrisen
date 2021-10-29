const ctf = require('../../src/commands/ctf');

describe('Ctf commands', () => {
	const channel = {
		name: 'ctf-channel',
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
		options: {
			getSubcommand: jest.fn(),
			getString: jest.fn(),
		},
		member: {
			guild: guild,
		},
	};

	const subCmdMock = interaction.options.getSubcommand;
	const getStringMock = interaction.options.getString;
	const findMock = guild.channels.cache.find;
	const createMock = guild.channels.create;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('adds a new ctf', async () => {
		subCmdMock.mockReturnValueOnce('add');
		getStringMock.mockReturnValueOnce('ctf-rocks');

		findMock.mockReturnValueOnce(channel)
			.mockReturnValueOnce(undefined);

		createMock.mockReturnValueOnce(channel);

		await ctf.execute(interaction);
		expect(interaction.reply).toHaveBeenCalledWith('CTF ctf-rocks successfully added.');
	});

	it('informs if ctf already exists', async () => {
		subCmdMock.mockReturnValueOnce('add');
		getStringMock.mockReturnValueOnce('ctf-rocks');

		findMock.mockReturnValueOnce(channel)
			.mockReturnValueOnce(channel);

		createMock.mockReturnValueOnce(channel);

		await ctf.execute(interaction);
		expect(interaction.reply).toHaveBeenCalledWith('CTF ctf-rocks already exists!');
	});
});

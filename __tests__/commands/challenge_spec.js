const challenge = require('../../src/commands/challenge');
const { channel, guild, interaction } = require('./mocks');

describe('Challenge command', () => {
	const findMock = guild.channels.cache.find;
	const getSubcommandMock = interaction.options.getSubcommand;
	const getStringMock = interaction.options.getString;
	const createChannelMock = guild.channels.create;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should prints an error if ctf is undefined', async () => {
		interaction.options.getSubcommand.mockReturnValueOnce('add');
		interaction.options.getString.mockReturnValueOnce('test-challenge');

		await challenge.execute(interaction);
		expect(interaction.reply).toHaveBeenCalledWith('⚠️ This command must be called from a CTF channel');
	});

	it('should create a new challenge', async () => {
		getSubcommandMock.mockReturnValueOnce('add');
		getStringMock.mockReturnValueOnce('test-challenge');

		findMock.mockReturnValueOnce(channel)
			.mockReturnValueOnce(channel)
			.mockReturnValueOnce(channel)
			.mockReturnValueOnce(undefined);

		createChannelMock.mockReturnValueOnce(channel)
			.mockReturnValueOnce(channel);

		await challenge.execute(interaction);
		expect(interaction.reply).toHaveBeenCalledWith('Challenge channel added');
	});

	it('should inform if challenge already exists', async () => {
		getSubcommandMock.mockReturnValueOnce('add');
		getStringMock.mockReturnValueOnce('test-challenge');

		findMock.mockReturnValueOnce(channel)
			.mockReturnValueOnce(channel)
			.mockReturnValueOnce(channel)
			.mockReturnValueOnce(channel);

		createChannelMock.mockReturnValueOnce(channel);

		await challenge.execute(interaction);
		expect(interaction.reply).toHaveBeenCalledWith('⚠️ This challenge already exists');
	});

	it('should print completion message', async () => {
		getSubcommandMock.mockReturnValueOnce('done') // this is consumed at the if statement
			.mockReturnValueOnce('done'); // this is consumed at the else if statement
		getStringMock.mockReturnValueOnce('');

		findMock.mockReturnValueOnce(channel)
			.mockReturnValueOnce(channel)
			.mockReturnValueOnce(channel);

		const expectedCreditString = `Challenge completed by <@${interaction.user.id}> :tada:`;

		await challenge.execute(interaction);
		expect(interaction.reply).toHaveBeenCalledWith(expectedCreditString);
	});

	it('should print completion message with multiple users', async () => {
		getSubcommandMock.mockReturnValueOnce('done') // this is consumed at the if statement
			.mockReturnValueOnce('done'); // this is consumed at the else if statement
		getStringMock.mockReturnValueOnce('<@111111111111111111>, <@222222222222222222>');

		findMock.mockReturnValueOnce(channel)
			.mockReturnValueOnce(channel)
			.mockReturnValueOnce(channel);
		
		const expectedMsg = `Challenge completed by <@${interaction.user.id}>, <@111111111111111111>, <@222222222222222222> :tada:`;

		await challenge.execute(interaction);
		expect(interaction.reply).toHaveBeenCalledWith(expectedMsg);
	});

	it('should print error message if not in a challenge channel', async () => {
		getSubcommandMock.mockReturnValueOnce('done') // this is consumed at the if statement
			.mockReturnValueOnce('done'); // this is consumed at the else if statement
		getStringMock.mockReturnValueOnce('');

		findMock.mockReturnValueOnce(channel)
			.mockReturnValueOnce(channel)
			.mockReturnValueOnce(undefined);
		
		const expectedErrMsg = 'You must be in a challenge channel to execute this command';
		await challenge.execute(interaction);
		expect(interaction.reply).toHaveBeenCalledWith(expectedErrMsg);
	});
});

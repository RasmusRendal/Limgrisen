const challenge = require('../../src/commands/challenge');

const { channel, guild, interaction } = require('./mocks');

const findMock = guild.channels.cache.find;
const getSubcommandMock = interaction.options.getSubcommand;
const getStringMock = interaction.options.getString;
const createChannelMock = guild.channels.create;

jest.mock('../../src/config', () => ({
	ctfpermissions: false
}));

beforeEach(() => {
	jest.clearAllMocks();
});

test('should prints an error if ctf is undefined', async () => {
	interaction.options.getSubcommand.mockReturnValueOnce('add');
	interaction.options.getString.mockReturnValueOnce('test-challenge');

	await challenge.execute(interaction);
	expect(interaction.reply).toHaveBeenCalledWith('⚠️ This command must be called from a CTF channel');
});

test('should create a new challenge', async () => {
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

test('should inform if challenge already exists', async () => {
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

test('should print completion message', async () => {
	getSubcommandMock.mockReturnValue('done');
	getStringMock.mockReturnValueOnce('');

	findMock.mockReturnValueOnce(channel)
		.mockReturnValueOnce(channel)
		.mockReturnValueOnce(channel);

	const expectedCreditString = `Challenge completed by <@${interaction.user.id}> :tada:`;

	await challenge.execute(interaction);
	expect(interaction.reply).toHaveBeenCalledWith(expectedCreditString);
});

test('should print completion message with multiple users', async () => {
	getSubcommandMock.mockReturnValue('done');
	getStringMock.mockReturnValueOnce('<@111111111111111111>, <@222222222222222222>');

	findMock.mockReturnValueOnce(channel)
		.mockReturnValueOnce(channel)
		.mockReturnValueOnce(channel);
	
	const expectedMsg = `Challenge completed by <@${interaction.user.id}>, <@111111111111111111>, <@222222222222222222> :tada:`;

	await challenge.execute(interaction);
	expect(interaction.reply).toHaveBeenCalledWith(expectedMsg);
});

test('should print error message if not in a challenge channel', async () => {
	getSubcommandMock.mockReturnValueOnce('done');
	getStringMock.mockReturnValueOnce('');

	findMock.mockReturnValueOnce(channel)
		.mockReturnValueOnce(channel)
		.mockReturnValueOnce(undefined);
	
	const expectedErrMsg = 'You must be in a challenge channel to execute this command';
	await challenge.execute(interaction);
	expect(interaction.reply).toHaveBeenCalledWith(expectedErrMsg);
});

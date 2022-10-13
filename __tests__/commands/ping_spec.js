const ping = require('../../src/commands/ping');

describe('Ping command', () => {
	const interaction = {
		reply: jest.fn()
	};

	it('should reply with "Pong!"', async () => {
		await ping.execute(interaction);
		expect(interaction.reply).toHaveBeenCalledWith('Pong!');
	});
});

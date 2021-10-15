# Limgrisen
A Discord bot for managing a CTF.

This is heavily a work in progress, and is not ready for real-world use.

## Getting started
To use the bot, you should have node and npm installed.
After this, run the commands:
```
npm install
cp config.sample.json config.json
```
Then you should go to the [Discord Developer Portal](https://discord.com/developers/) to create your own bot.
Then, you should add the bot to the server. You do this by following the following URL: `https://discord.com/api/oauth2/authorize?client_id=<client id>&permissions=8&scope=bot%20applications.commands` (It probably doesn't need all those permissions, but who wants to sort that out?)

Copy the token, client id, and guild id into `config.json`, and then you should be able to run the bot by first registering commands (`node src/deploy-commands.js`) and then running the bot `node src/index.js`.

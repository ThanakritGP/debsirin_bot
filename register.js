import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },

  {
    name: 'menu',
    description: 'Random Food🍕',
  },

  {
    name: 'dessert-menu',
    description: 'Random Dessert🥞',
  },

  {
    name: 'adout-debsirin-bot',
    description: 'Information about DS-BOT',
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}
import { Bot } from "grammy";

export const setCommands = async (bot: Bot) => {
  await bot.api.setMyCommands([
    { command: "start", description: "Start the bot" },
    { command: "temperature", description: "Get the temperature" },
    { command: "ping", description: "Ping the bot" },
  ])
}
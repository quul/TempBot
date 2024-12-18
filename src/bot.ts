import "dotenv/config";

import { Bot } from "grammy";
import { getTemperature } from "./lib";
import { setCommands } from "./scripts/setCommands";

// Create an instance of the `Bot` class and pass your bot token to it.
export const bot = new Bot(process.env.BOT_TOKEN!); // <-- put your bot token between the ""

// You can now register listeners on your bot object `bot`.
// grammY will call the listeners when users send messages to your bot.

// Handle the /start command.
bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

bot.command("ping", async (ctx) => {
  // `reply` is an alias for `sendMessage` in the same chat (see next section).
  await ctx.reply("pong", {
    // `reply_parameters` specifies the actual reply feature.
    reply_parameters: { message_id: ctx.msg.message_id },
  });
});

bot.command("temperature", async (ctx) => {
  const temperature = await getTemperature();

  if (temperature) {
    await bot.api.sendMessage(
        ctx.chat.id,
        `Weather data now:
        Temperature: \`${temperature["pvvx_temperature"]}\`°C
        Humidity: \`${temperature["pvvx_humidity"]}\`%
        Time: \`${new Date(temperature["timestamp"] * 1000).toLocaleString()}\`
        `,
        { reply_to_message_id: ctx.msg.message_id, parse_mode: "MarkdownV2" }
    )
  } else {
    await ctx.reply("No temperature data available");
  }
});

// Now that you specified how to handle messages, you can start your bot.
// This will connect to the Telegram servers and wait for messages.

await setCommands(bot);
// Start the bot.
bot.start();

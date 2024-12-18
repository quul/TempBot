import "dotenv/config";

import { Bot, InputFile } from "grammy";
import { getLatestTemperature, getTemperatureLastDay } from "./lib";
import { setCommands } from "./scripts/setCommands";
import { ChartType, generateDiagram } from "./diagram";

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
  const metrics = await getLatestTemperature();
  if (metrics) {
    const rooms = Object.keys(metrics);
    for (const room of rooms) {
      const temperature = metrics[room].temperature[1].toString()
      const humidity = metrics[room].humidity[1].toString()
      const time = (new Date(metrics[room].temperature[0] * 1000)).toLocaleString()
      await bot.api.sendMessage(
        ctx.chat.id,
        `Weather data for ${room}:
        Temperature: \`${temperature}\`°C
        Humidity: \`${humidity}\`%
        Time: \`${time}\`
        `,
        { reply_to_message_id: ctx.msg.message_id, parse_mode: "MarkdownV2" }
    )
    }
  } else {
    await ctx.reply("No temperature data available");
  }
});

bot.command("diagram", async (ctx) => {
  const metrics = await getTemperatureLastDay();
  if (!metrics) {
    await ctx.reply("No temperature data available");
    return;
  }
  const temperatureBuffer = await generateDiagram(metrics, ChartType.Temperature);
  const humidityBuffer = await generateDiagram(metrics, ChartType.Humidity);
  await ctx.replyWithPhoto(new InputFile(temperatureBuffer));
  await ctx.replyWithPhoto(new InputFile(humidityBuffer));
})

// Set the commands for the bot.
await setCommands(bot);
// Start the bot.
bot.start();

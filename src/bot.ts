import "dotenv/config";

import { Bot, InputFile } from "grammy";
import { getLatestTemperature, getTemperatureLastDay } from "./lib";
import { setCommands } from "./scripts/setCommands";
import { ChartType, generateDiagram } from "./diagram";
import { logger } from "./logger";
import { ProxyAgent } from "proxy-agent";

const botToken = process.env.BOT_TOKEN;
if (!botToken) {
  throw new Error("BOT_TOKEN is not set");
}

const agent = new ProxyAgent();

// Create an instance of the `Bot` class and pass your bot token to it.
export const bot = new Bot(botToken, {
  client: {
    baseFetchConfig: {
      agent,
      compress: true,
    },
  },
});

// You can now register listeners on your bot object `bot`.
// grammY will call the listeners when users send messages to your bot.

// Handle the /start command.
bot.command("start", (ctx) => {
  logger.info("Start command received", { userId: ctx.from?.id });
  return ctx.reply("Welcome! Up and running.");
});

bot.command("ping", async (ctx) => {
  logger.info("Ping command received", { userId: ctx.from?.id });
  // `reply` is an alias for `sendMessage` in the same chat (see next section).
  await ctx.reply("pong", {
    // `reply_parameters` specifies the actual reply feature.
    reply_parameters: { message_id: ctx.msg.message_id },
  });
});

bot.command("temperature", async (ctx) => {
  logger.info("Temperature command received", { userId: ctx.from?.id });
  const metrics = await getLatestTemperature();
  if (metrics) {
    const rooms = Object.keys(metrics);
    logger.debug("Retrieved temperature metrics", { rooms });
    for (const room of rooms) {
      const temperature = metrics[room].temperature[1].toString();
      const humidity = metrics[room].humidity[1].toString();
      const time = new Date(
        metrics[room].temperature[0] * 1000
      ).toLocaleString();
      await bot.api.sendMessage(
        ctx.chat.id,
        `Weather data for ${room}:
                Temperature: \`${temperature}\`°C
                Humidity: \`${humidity}\`%
                Time: \`${time}\`
                `,
        { reply_to_message_id: ctx.msg.message_id, parse_mode: "MarkdownV2" }
      );
      logger.debug("Sent temperature data", {
        room,
        temperature,
        humidity,
        time,
      });
    }
  } else {
    logger.warn("No temperature data available");
    await ctx.reply("No temperature data available");
  }
});

bot.command("diagram", async (ctx) => {
  logger.info("Diagram command received", { userId: ctx.from?.id });
  const metrics = await getTemperatureLastDay();
  if (!metrics) {
    logger.warn("No temperature data available for diagram");
    await ctx.reply("No temperature data available");
    return;
  }
  logger.debug("Generating temperature and humidity diagrams");
  const temperatureBuffer = await generateDiagram(
    metrics,
    ChartType.Temperature
  );
  const humidityBuffer = await generateDiagram(metrics, ChartType.Humidity);
  await ctx.replyWithPhoto(new InputFile(temperatureBuffer));
  await ctx.replyWithPhoto(new InputFile(humidityBuffer));
  logger.debug("Sent diagram images");
});

// Set the commands for the bot.
await setCommands(bot);
logger.info("Bot commands set successfully");

// Start the bot.
bot.start();
logger.info("Bot started successfully");

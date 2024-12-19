# TempBot

A Telegram bot built with TypeScript that generates diagrams and visualizations using ECharts and Canvas.

## Features

- Built with [grammY](https://grammy.dev/) - modern Telegram bot framework
- Written in TypeScript for better type safety and developer experience
- Uses ECharts for generating charts and visualizations
- Canvas support for image manipulation
- Hot-reload development environment

## Prerequisites

- Node.js (LTS version recommended)
- pnpm package manager

## Installation

1. Clone the repository
2. Install dependencies:
```bash
pnpm install
```
3. Copy the environment example file and configure your settings:
```bash
cp .env.example .env
```
4. Update the `.env` file with your Telegram bot token and other required configurations

## Development

To run the bot in development mode with hot-reload:

```bash
pnpm dev
```

## Building and Production

Build the project:
```bash
pnpm build
```

Run in production:
```bash
pnpm start
```

## Project Structure

- `src/` - Source code directory
  - `bot.ts` - Main bot entry point
  - `diagram.ts` - Diagram generation logic

## License

MIT License

## Author

Created with ♥️ using TypeScript and grammY

# League Stats

A modern League of Legends stats tracker that lets you view recent match performance for any player.

**Live Demo:** [https://league-stats-zi0y.onrender.com](https://league-stats-zi0y.onrender.com)

## Features

- 🔍 Search players by Riot ID (Name#TAG)
- 📊 View last 5 matches with detailed stats
- 🎮 Champion, KDA, CS, and item information
- 🏆 Win/loss tracking with colored indicators
- 📱 Responsive design for mobile and desktop
- 🎨 Modern dark theme inspired by League of Legends

## Tech Stack

- **Backend:** Node.js, Express, TypeScript
- **API:** Riot Games API
- **Deployment:** Render
- **Styling:** Vanilla CSS with glassmorphism effects

## Getting Started

### Prerequisites

- Node.js 18.x
- Riot Games API Key ([Get one here](https://developer.riotgames.com/))

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/league-stats.git
cd league-stats
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file
```env
RIOT_API_KEY=your_api_key_here
PORT=3030
```

4. Build and start
```bash
npm run postinstall
npm start
```

5. Open [http://localhost:3030](http://localhost:3030)

## Development

```bash
# Watch TypeScript changes
npm run watch-ts

# Run with nodemon
npm run start:dev
```

## Deployment on Render

1. Fork this repository
2. Create a new Web Service on [Render](https://render.com)
3. Connect your GitHub repository
4. Add environment variable: `RIOT_API_KEY`
5. Deploy!

Render will automatically use the `render.yaml` configuration.

## API Endpoints

### GET `/`
Returns the main search page

### POST `/`
Accepts form data with `name` field (Riot ID) and returns match history

## Project Structure

```
league-stats/
├── src/
│   └── index.ts          # Main application code
├── dist/                 # Compiled JavaScript (gitignored)
├── .env                  # Environment variables (gitignored)
├── render.yaml           # Render deployment config
├── package.json
└── tsconfig.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## License

ISC

## Acknowledgments

- [Riot Games API](https://developer.riotgames.com/)
- [Data Dragon](https://developer.riotgames.com/docs/lol#data-dragon) for game assets
- League of Legends design inspiration

---

**Note:** This application uses the Riot Games API but is not endorsed or sponsored by Riot Games.

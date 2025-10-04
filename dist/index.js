"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const header = {
    method: 'GET',
    headers: {
        "X-Riot-Token": process.env.RIOT_API_KEY || "",
    },
};
async function getPUUID(riotId) {
    // produce the puuid of the given riot id (gameName#tagLine)
    try {
        const [gameName, tagLine] = riotId.split('#');
        if (!gameName || !tagLine) {
            throw new Error('Invalid Riot ID format. Use: GameName#TAG');
        }
        const res = await fetch(`https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`, header);
        if (!res.ok) {
            throw new Error('Error ' + res.status);
        }
        const result = (await res.json());
        return result.puuid;
    }
    catch (error) {
        if (error instanceof Error) {
            console.log('error message: ', error.message);
            return error.message;
        }
        else {
            console.log('unexpected error: ', error);
            return 'An unexpected error occurred';
        }
    }
}
async function getMatches(puuid) {
    // produce the html data of the recent 5 matches of the given puuid
    try {
        const res = await fetch('https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/' + puuid + '/ids?start=0&count=5&', header);
        if (!res.ok) {
            throw new Error('Error fetching match list: ' + res.status);
        }
        const result = await res.json();
        console.log('Found matches:', result);
        if (!result || result.length === 0) {
            return '<p>No recent matches found for this player.</p>';
        }
        const matches = [];
        for (let i = 0; i < Math.min(5, result.length); i++) {
            const match = await getMatch(result[i], puuid);
            matches.push(match);
        }
        return matches.map(m => '<li class="match-item">' + m + '</li>').join('');
    }
    catch (error) {
        if (error instanceof Error) {
            console.log('error message: ', error.message);
            return '<p>' + error.message + '</p>';
        }
        else {
            console.log('unexpected error: ', error);
            return '<p>An unexpected error occurred</p>';
        }
    }
}
async function getMatch(id, puuid) {
    // produce and render the data in html of given match id and puuid
    try {
        const res = await fetch('https://americas.api.riotgames.com/lol/match/v5/matches/' + id, header);
        if (!res.ok) {
            console.log('Match fetch failed for:', id, 'Status:', res.status);
            throw new Error('Error ' + res.status);
        }
        const result = (await res.json());
        const pdata = result.info.participants.filter((p) => p.puuid === puuid)[0];
        var table = '<table><tbody><tr>';
        const duration = result.info.gameDuration;
        if (pdata.win) {
            let td1 = `<td>
					<p class="victory">Victory</p>
					<p>${Math.round((duration / 60) * 100) / 100} min</p>
				</td>`;
            table += td1;
        }
        else {
            let td1 = `<td>
					<p class="defeat">Defeat</p>
					<p>${Math.round((duration / 60) * 100) / 100} min</p>
				</td>`;
            table += td1;
        }
        ;
        const spell1 = await getSpellIcon(pdata.summoner1Id);
        const spell2 = await getSpellIcon(pdata.summoner2Id);
        const perk1 = await getPerkIcon(pdata.perks.styles[0].style);
        const perk2 = await getPerkIcon(pdata.perks.styles[1].style);
        let td2 = `<td>
				<p>${pdata.summonerName}</p>
				<p>
					<img src=${spell1} width="32" height="32" />
					<img src=${spell2} width="32" height="32" />
					<img src=${perk1} width="32" height="32" />
					<img src=${perk2} width="32" height="32" />
				</p>
			</td>`;
        table += td2;
        const kda = Math.round((pdata.kills + pdata.assists) / Math.max(1, pdata.deaths) * 100) / 100;
        let td3 = `<td><p>${pdata.kills} / ${pdata.deaths} / ${pdata.assists}</p><p>${kda} KDA</p></td>`;
        table += td3;
        const cs = pdata.neutralMinionsKilled + pdata.totalMinionsKilled;
        let td4 = `<td>
				<p>${pdata.championName} Level: ${pdata.champLevel}</p>
				<p>${cs} (${Math.round(cs / (duration / 60) * 100) / 100}) CS</p>
			</td>`;
        table += td4;
        table += '</tr><tr>';
        const item0 = await getItemIcon(pdata.item0);
        const item1 = await getItemIcon(pdata.item1);
        const item2 = await getItemIcon(pdata.item2);
        const item3 = await getItemIcon(pdata.item3);
        const item4 = await getItemIcon(pdata.item4);
        const item5 = await getItemIcon(pdata.item5);
        const item6 = await getItemIcon(pdata.item6);
        let td5 = `<td colspan="4">
				${item0} ${item1} ${item2} ${item3} ${item4} ${item5} ${item6}
			</td>`;
        table += td5;
        table += '</tr></tbody></table>';
        return table;
    }
    catch (error) {
        if (error instanceof Error) {
            console.log('error message: ', error.message);
            return error.message;
        }
        else {
            console.log('unexpected error: ', error);
            return 'An unexpected error occurred';
        }
    }
}
async function getSpellIcon(id) {
    // produce the url of the spell of the given id
    try {
        const res = await fetch('https://ddragon.leagueoflegends.com/cdn/15.19.1/data/en_US/summoner.json');
        if (!res.ok) {
            throw new Error('Error ' + res.status);
        }
        const result = (await res.json());
        const spells = Object.keys(result.data);
        for (let s in spells) {
            const sdata = result.data[spells[s]];
            if (sdata.key == id) {
                return 'https://ddragon.leagueoflegends.com/cdn/15.19.1/img/spell/' + spells[s] + '.png';
            }
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.log('error message: ', error.message);
            return error.message;
        }
        else {
            console.log('unexpected error: ', error);
            return 'An unexpected error occurred';
        }
    }
}
async function getPerkIcon(id) {
    // produce the icon url of the perk of the given id
    try {
        const res = await fetch('https://ddragon.leagueoflegends.com/cdn/15.19.1/data/en_US/runesReforged.json');
        if (!res.ok) {
            throw new Error('Error ' + res.status);
        }
        const result = await res.json();
        const rune = result.filter((r) => r.id === id)[0];
        return 'https://ddragon.canisback.com/img/' + rune.icon;
    }
    catch (error) {
        if (error instanceof Error) {
            console.log('error message: ', error.message);
            return error.message;
        }
        else {
            console.log('unexpected error: ', error);
            return 'An unexpected error occurred';
        }
    }
}
async function getItemIcon(id) {
    // produce the icon <img> of the item of the given id
    try {
        const res = await fetch('https://ddragon.leagueoflegends.com/cdn/15.19.1/data/en_US/item.json');
        if (!res.ok) {
            throw new Error('Error ' + res.status);
        }
        const result = (await res.json());
        const item = result.data[id];
        if (item) {
            return `<img
				src=${'https://ddragon.leagueoflegends.com/cdn/15.19.1/img/item/' + item.image.full}
				width="32" height="32"
			/>`;
        }
        else {
            return '';
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.log('error message: ', error.message);
            return error.message;
        }
        else {
            console.log('unexpected error: ', error);
            return 'An unexpected error occurred';
        }
    }
}
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3030;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const wp1 = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>League Stats - Track Your Performance</title>
	<style>
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}

		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
			background: linear-gradient(135deg, #0a1428 0%, #1e2a3a 100%);
			color: #e4e4e7;
			min-height: 100vh;
			padding: 20px;
		}

		.container {
			max-width: 1200px;
			margin: 0 auto;
		}

		header {
			text-align: center;
			padding: 40px 20px;
		}

		h1 {
			font-size: 2.5rem;
			font-weight: 700;
			background: linear-gradient(to right, #c89b3c, #f0e6d2);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			background-clip: text;
			margin-bottom: 10px;
		}

		.subtitle {
			color: #a0a0a8;
			font-size: 1.1rem;
		}

		.search-section {
			background: rgba(30, 42, 58, 0.6);
			backdrop-filter: blur(10px);
			border: 1px solid rgba(200, 155, 60, 0.2);
			border-radius: 12px;
			padding: 30px;
			margin: 30px auto;
			max-width: 600px;
		}

		form {
			display: flex;
			gap: 12px;
			flex-direction: column;
		}

		input[type="text"] {
			width: 100%;
			padding: 14px 20px;
			font-size: 1rem;
			background: rgba(10, 20, 40, 0.6);
			border: 2px solid rgba(200, 155, 60, 0.3);
			border-radius: 8px;
			color: #e4e4e7;
			transition: all 0.3s ease;
		}

		input[type="text"]::placeholder {
			color: #71717a;
		}

		input[type="text"]:focus {
			outline: none;
			border-color: #c89b3c;
			box-shadow: 0 0 0 3px rgba(200, 155, 60, 0.1);
		}

		button {
			padding: 14px 28px;
			font-size: 1rem;
			font-weight: 600;
			background: linear-gradient(135deg, #c89b3c 0%, #a67c2e 100%);
			color: #0a1428;
			border: none;
			border-radius: 8px;
			cursor: pointer;
			transition: all 0.3s ease;
		}

		button:hover {
			transform: translateY(-2px);
			box-shadow: 0 8px 16px rgba(200, 155, 60, 0.3);
		}

		button:active {
			transform: translateY(0);
		}

		.results {
			margin-top: 30px;
		}

		.player-name {
			font-size: 1.8rem;
			font-weight: 600;
			color: #c89b3c;
			margin-bottom: 20px;
			text-align: center;
		}

		.matches-list {
			list-style: none;
			display: flex;
			flex-direction: column;
			gap: 16px;
		}

		.match-item {
			background: rgba(30, 42, 58, 0.6);
			border: 1px solid rgba(200, 155, 60, 0.2);
			border-radius: 10px;
			overflow: hidden;
		}

		table {
			width: 100%;
			border-collapse: collapse;
		}

		td {
			padding: 16px;
			border-bottom: 1px solid rgba(200, 155, 60, 0.1);
		}

		td:last-child {
			border-bottom: none;
		}

		.victory {
			color: #10b981;
			font-weight: 600;
		}

		.defeat {
			color: #ef4444;
			font-weight: 600;
		}

		img {
			border-radius: 4px;
			margin: 2px;
		}

		.error {
			background: rgba(239, 68, 68, 0.1);
			border: 1px solid rgba(239, 68, 68, 0.3);
			color: #fca5a5;
			padding: 12px 16px;
			border-radius: 8px;
			text-align: center;
		}

		@media (max-width: 768px) {
			h1 {
				font-size: 2rem;
			}

			.search-section {
				padding: 20px;
			}

			td {
				padding: 12px;
				font-size: 0.9rem;
			}
		}
	</style>
</head>
<body>
	<div class="container">
		<header>
			<h1>League of Legends Stats</h1>
			<p class="subtitle">Track your recent match performance</p>
		</header>

		<div class="search-section">
			<form action="/" method="post" id="form">
				<input name="name" type="text" placeholder="Enter Riot ID (e.g., Faker#KR1)" required />
				<button type="submit">Search Player</button>
			</form>
		</div>
`;
const wp2 = `
	</div>
</body>
</html>
`;
app.get('/', (req, res) => {
    res.send(wp1 + wp2);
});
app.post('/', async (req, res) => {
    const name = req.body.name;
    const puuid = await getPUUID(name);
    const result = await getMatches(puuid);
    const resultsSection = `
		<div class="results">
			<h2 class="player-name">${name}</h2>
			<ul class="matches-list">
				${result}
			</ul>
		</div>
	`;
    res.send(wp1 + resultsSection + wp2);
});
app.listen(PORT, () => {
    console.log(`[server]: Server is running at https://localhost:${PORT}`);
});

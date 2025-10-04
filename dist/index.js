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
        let lom = '<ul>' + matches.map(m => '<li>' + m + '</li>').join('') + '</ul>';
        return lom;
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
        var table = '<table border="1"><tbody><tr>';
        const duration = result.info.gameDuration;
        if (pdata.win) {
            let td1 = `<td>
					<p>Victory</p>
					<p>${Math.round((duration / 60) * 100) / 100} minutes</p>
				</td>`;
            table += td1;
        }
        else {
            let td1 = `<td>
					<p>Defeat</p>
					<p>${Math.round((duration / 60) * 100) / 100} minutes</p>
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
		<html>
			<head><title>League Stats</title></head>
			<body>
		`;
const sec1 = `
		<div align="center"><h1>League of Legends Stats</h1>
		<form action="/" method="post" id="form">
			<input name="name" type="text" placeholder="enter Riot ID (Name#TAG)" style="text-align:center" value="" />
		</form>
		<p><button form="form" type="submit" value="Submit">submit</button></p>
		</div>
		`;
const wp2 = `
				</div>
			</body>
		</html>
		`;
app.get('/', (req, res) => {
    // initialize page and form
    res.send(wp1 + sec1 + wp2);
});
app.post('/', async (req, res) => {
    // get enterned name and display data
    const name = req.body.name;
    var sec2 = `
		<div align="center" id="result"
		<h1>${name}</h1>
		`;
    const puuid = await getPUUID(name);
    const result = await getMatches(puuid);
    sec2 += result;
    res.send(wp1 + sec1 + sec2 + wp2);
});
app.listen(PORT, () => {
    console.log(`[server]: Server is running at https://localhost:${PORT}`);
});

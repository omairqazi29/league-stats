"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const header = {
    method: 'GET',
    headers: {
        "X-Riot-Token": "RGAPI-0b435288-7ac4-44a1-b1d9-cddb03fb739a",
    },
};
async function getPUUID(name) {
    // produce the puuid of the given summoner name
    try {
        const res = await (0, node_fetch_1.default)('https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + name, header);
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
        const res = await (0, node_fetch_1.default)('https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/' + puuid + '/ids?start=0&count=5&', header);
        if (!res.ok) {
            throw new Error('Error ' + res.status);
        }
        const result = await res.json();
        const match0 = await getMatch(result[0], puuid);
        const match1 = await getMatch(result[1], puuid);
        const match2 = await getMatch(result[2], puuid);
        const match3 = await getMatch(result[3], puuid);
        const match4 = await getMatch(result[4], puuid);
        let lom = '<ul><li>' + match0 + '</li><li>' + match1 + '</li><li>' + match2 + '</li><li>' + match3 + '</li><li>' + match4 + '</li><ul>';
        return lom;
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
async function getMatch(id, puuid) {
    // produce and render the data in html of given match id and puuid
    try {
        const res = await (0, node_fetch_1.default)('https://americas.api.riotgames.com/lol/match/v5/matches/' + id, header);
        if (!res.ok) {
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
					<p>${duration} seconds</p>
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
					<img src=${spell1} alt="" width="32" height="32" />
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
				<img src=${item0} alt="" width="32" height="32" />
				<img src=${item1} width="32" height="32" />
				<img src=${item2} width="32" height="32" />
				<img src=${item3} width="32" height="32" />
				<img src=${item4} width="32" height="32" />
				<img src=${item5} width="32" height="32" />
				<img src=${item6} width="32" height="32" />
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
        const res = await (0, node_fetch_1.default)('https://ddragon.leagueoflegends.com/cdn/12.22.1/data/en_US/summoner.json');
        if (!res.ok) {
            throw new Error('Error ' + res.status);
        }
        const result = (await res.json());
        const spells = Object.keys(result.data);
        for (let s in spells) {
            const sdata = result.data[spells[s]];
            if (sdata.key == id) {
                return 'http://ddragon.leagueoflegends.com/cdn/12.22.1/img/spell/' + spells[s] + '.png';
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
        const res = await (0, node_fetch_1.default)('http://ddragon.leagueoflegends.com/cdn/10.16.1/data/en_US/runesReforged.json');
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
    // produce the icon url of the item of the given id
    try {
        const res = await (0, node_fetch_1.default)('http://ddragon.leagueoflegends.com/cdn/12.22.1/data/en_US/item.json');
        if (!res.ok) {
            throw new Error('Error ' + res.status);
        }
        const result = (await res.json());
        const item = result.data[id];
        return 'http://ddragon.leagueoflegends.com/cdn/12.22.1/img/item/' + item.image.full;
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
const port = process.env.PORT || 3030;
app.use(express.json());
app.use(express.urlencoded());
const wp1 = `
		<html>
			<head><title>League Stats</title></head>
			<body>
		`;
const sec1 = `
		<div align="center"><h1>League of Legends Stats</h1>
		<form action="/" method="post" id="form">
			<input name="name" type="text" placeholder="enter summoner name" style="text-align:center" value="" />
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
app.listen(port, () => {
    console.log(`[server]: Server is running at https://localhost:${port}`);
});

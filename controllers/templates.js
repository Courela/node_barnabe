const fs = require('fs');
const btoa = require('btoa');
const path = require('path');
const pug = require('pug');
const puppeteer = require('puppeteer');
const playersMgr = require('../managers/players');
const teamsMgr = require('../managers/teams');
const errors = require('../errors');

const MAX_EMPTY_LINES = 5;
const MAX_PLAYER_LINES = 18;

async function teamTemplate(req, res) {
    const { season, teamId, stepId } = req.query;

    if (season && teamId && stepId) {
        var data = await getTeamDataForTemplate(season, teamId, stepId);

        try {
            const html = parseTemplate(data, './views/team_game_sheet.pug');
            const src = await getPdf(html);
            res.send({ src: src });
        }
        catch (err) {
            errors.handleErrors(res, err);
            res.send();
        }
    }
    else {
        res.statusCode = 400;
        res.send();
    }
}

async function getTeamDataForTemplate(season, teamId, stepId) {
    const teams = await teamsMgr.getTeams();
    const team = teams.find(t => t.Id == parseInt(teamId));

    const step = await teamsMgr.getStep(parseInt(stepId));

    var players = await playersMgr.getPlayers(parseInt(season), parseInt(teamId), parseInt(stepId), [1]);
    players = addEmptyPlayerLines(players ? mapPlayers(players) : []);

    const staff = await playersMgr.getPlayers(parseInt(season), parseInt(teamId), parseInt(stepId), [2, 3, 4, 5, 6]);

    var teamLogoFilename = getTeamLogoFilename(parseInt(teamId));
    const basePath = path.join(__dirname, '..', 'public' + path.sep);
    var teamLogo = fs.readFileSync(basePath + teamLogoFilename);
    var logo = fs.readFileSync(basePath + 'logo.png');

    const data = {
        team: team.Name,
        step: step.Description,
        players: players,
        staff: staff ? staff.map(p => { return { name: formatName(getPersonName(p)), role: p.Role.Description}; }) : [],
        teamLogo: 'data:image/jpg;base64,' + btoa(teamLogo),
        logo: 'data:image/png;base64,' + btoa(logo)
    };

    return data;
}

function isLocal(player) {
    const { Person, Caretaker } = player;
    const result = Person.LocalBorn || player.Resident || (Caretaker && Caretaker.VoterNr) ? true : (Person.VoterNr ? true : false);
    return result;
}

function mapPlayers(players) {
    return players.map(p => { return { name: formatName(p.Person.Name.toLowerCase()), isLocal: isLocal(p), isTown: !!p.Person.LocalTown }; });
}

async function gameTemplate(req, res) {
    const { season, homeTeamId, awayTeamId, stepId } = req.query;
    
    if (season && homeTeamId && awayTeamId && stepId) {
        const data = await getGameDataForTemplate(season, homeTeamId, awayTeamId, stepId);
        
        try {
            const html = parseTemplate(data, './views/game_sheet.pug');
            const src = await getPdf(html);
            
            res.send({ src: src });
        }
        catch (err) {
            console.error(err);
            res.statusCode = 500;
            res.send();
        }
    }
    else {
        res.statusCode = 400;
        res.send();
    }
}

async function getGameDataForTemplate(season, homeTeamId, awayTeamId, stepId) {
    const teams = await teamsMgr.getTeams();
    const homeTeam = teams.find(t => t.Id == parseInt(homeTeamId));
    const awayTeam = teams.find(t => t.Id == parseInt(awayTeamId));
    
    const step = await teamsMgr.getStep(parseInt(stepId));
    
    var homePlayers = await playersMgr.getPlayers(parseInt(season), parseInt(homeTeamId), parseInt(stepId), [1]);
    homePlayers = addEmptyPlayerLines(homePlayers ? mapPlayers(homePlayers) : []);
    const homeStaff = await playersMgr.getPlayers(parseInt(season), parseInt(homeTeamId), parseInt(stepId), [2, 3, 4, 5, 6]);
    
    var awayPlayers = await playersMgr.getPlayers(parseInt(season), parseInt(awayTeamId), parseInt(stepId), [1]);
    awayPlayers = addEmptyPlayerLines(awayPlayers ? mapPlayers(awayPlayers) : []);
    const awayStaff = await playersMgr.getPlayers(parseInt(season), parseInt(awayTeamId), parseInt(stepId), [2, 3, 4, 5, 6]);
    
    const basePath = path.join(__dirname, '..', 'public' + path.sep);
    var logo = fs.readFileSync(basePath + 'logo.png');
    
    const data = {
        homeTeam: homeTeam.ShortDescription,
        awayTeam: awayTeam.ShortDescription,
        step: step.Description,
        homePlayers: homePlayers,
        homeStaff1: homeStaff ? homeStaff.slice(0,2).map(p => { return { name: formatName(getPersonName(p), 3), role: p.Role.Description}; }) : [],
        homeStaff2: homeStaff ? homeStaff.slice(2,4).map(p => { return { name: formatName(getPersonName(p), 3), role: p.Role.Description}; }) : [],
        awayPlayers: awayPlayers,
        awayStaff1: awayStaff ? awayStaff.slice(0,2).map(p => { return { name: formatName(getPersonName(p), 3), role: p.Role.Description}; }) : [],
        awayStaff2: awayStaff ? awayStaff.slice(2,4).map(p => { return { name: formatName(getPersonName(p), 3), role: p.Role.Description}; }) : [],
        logo: 'data:image/png;base64,' + btoa(logo)
    };

    return data;
}

function getPersonName(p) {
    return p && p.Person && p.Person.Name ? p.Person.Name.toLowerCase() : '';
}

function addEmptyPlayerLines(arr) {
    if (arr && arr.length) {
        for(var i = arr.length, j = arr.length; i < MAX_PLAYER_LINES && i - j < MAX_EMPTY_LINES  ; i++) {
            arr.push({ });
        }
    }
    return arr;
}

function formatName(val, nrNames = 3) {
    var name = val.toLowerCase();
    var names = name.split(' ');
    while(names.length > nrNames) {
        names.splice(2, 1);
    }
    var result = [];
    for(var i = 0; i < names.length; i++) {
        var curr = names[i];
        result.push(capitalizeFirstLetter(curr));
    }
    return result.join(' ');
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getTeamLogoFilename(teamId) {
    var result = 'logo.jpg';
    switch (teamId) {
        case 1:
            result = 'sabugo.jpg';
            break;
        case 2:
            result = 'aruil.jpg';
            break;
        case 3:
            result = 'albogas.jpg';
            break;
        case 4:
            result = 'vale_lobos.jpg';
            break;
        case 5:
            result = 'negrais.jpg';
            break;
        case 6:
            result = 'saloios.jpg';
            break;
        case 7:
            result = 'camponeses.jpg';
            break;
        case 8:
            result = 'almargense.jpg';
            break;
        case 9:
            result = 'almornense.jpg';
            break;
        case 10:
            result = 'covas_ferro.jpg';
            break;
        case 11:
            result = 'camaroes.jpg';
            break;
        case 12:
            result = 'maceira.jpg';
            break;
        case 13:
            result = 'montelavar.jpg';
            break;
        case 14:
            result = 'pero_pinheiro.jpg';
            break;
        case 15:
            result = 'ancos.jpg';
            break;
    }
    return result;
}
   
async function getPdf(data) {
    const browser = await puppeteer.launch(
      {
        headless: true,
        args: ['--no-sandbox', "--disabled-setupid-sandbox"]
      }
    );

    const page = await browser.newPage();         // create new tab
    await page.setContent(data);
    var teamPdf = await page.pdf({ format: 'A4', landscape: true });           // generate pdf and save it in page.pdf file
    await browser.close();                        // close browser
    
    return "data:application/pdf;base64," + btoa(teamPdf);
}

function parseTemplate(data, template) {
    const compiledFunction = pug.compileFile(template);
    return compiledFunction(data);
}

module.exports = {
    teamTemplate,
    gameTemplate
}
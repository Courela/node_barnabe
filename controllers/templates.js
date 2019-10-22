const fs = require('fs');
const btoa = require('btoa');
const path = require('path');
const pug = require('pug');
const pdf = require('html-pdf');
const playersMgr = require('../managers/players');
const teamsMgr = require('../managers/teams');

const MIN_EMPTY_LINES = 4;
const MAX_PLAYER_LINES = 21;

async function teamTemplate(req, res) {
    const { season, teamId, stepId } = req.query;

    if (season && teamId && stepId) {
        const teams = await teamsMgr.getTeams();
        const team = teams.find(t => t.Id == parseInt(teamId));

        const step = await teamsMgr.getStep(parseInt(stepId));

        // var players = await playersMgr.getPlayers(parseInt(season), parseInt(teamId), parseInt(stepId), [1]);
        // players = addEmptyPlayerLines(players ? mapPlayers(players) : []);

        var players = await getPlayers(parseInt(season), parseInt(teamId), parseInt(stepId), [1], 9999, true);

        //const staff = await playersMgr.getPlayers(parseInt(season), parseInt(teamId), parseInt(stepId), [2, 3, 4, 5, 6]);
        const staff = await getPlayers(parseInt(season), parseInt(teamId), parseInt(stepId), [2, 3, 4, 5, 6]);

        const data = {
            team: team.Name,
            step: step.Description,
            players: players,
            staff: staff ? staff.map(p => { return { name: formatName(p.person.Name.toLowerCase()), role: p.role.Description}; }) : []
        };

        try {
            const basePath = path.join(__dirname, '..', 'public' + path.sep);
            //console.log('Base path: ', basePath);

            fs.copyFileSync(path.join(basePath, getTeamLogoFilename(parseInt(teamId))), path.join(basePath, 'team.jpg'));

            const compiledFunction = pug.compileFile('./views/team_game_sheet.pug');
            const result = compiledFunction(data);

            var options = {
                format: 'A4',
                orientation: "landscape",
                base: "file:///" + basePath,
                border: "8mm"
            };

            pdf.create(result, options).toBuffer(function (err, buffer) {
                if (err) { 
                    return console.log(err); 
                }
                const src = "data:application/pdf;base64," + btoa(buffer);
                res.send({ src: src });
            });

            // pdf.create(result, options).toFile(path.join(basePath, 'doc/team_game_sheet.pdf'), function (err, result) {
            //     if (err) { 
            //         return console.log(err); 
            //     }

            //     console.log('Generated PDF: ', result);
            //     // const src = "data:application/pdf;base64," + btoa(fs.readFileSync(result.filename));
            //     // res.send({ src: src });
            // });
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

    // console.log(result);

    //res.render('team_game_sheet', data);

    //const src = "data:application/pdf;base64," + btoa(fs.readFileSync());
    //res.send({ src: src });
}

function isLocal(player) {
    //console.log('Row:',row);
    const { person, caretaker } = player;
    const result = person.LocalBorn || player.Resident || (caretaker && caretaker.VoterNr) ? true : (person.VoterNr ? true : false);
    return result;
}

function mapPlayers(players) {
    return players.map(p => { return { name: formatName(p.person.Name.toLowerCase()), isLocal: isLocal(p), isTown: false }; });
}

async function gameTemplate(req, res) {
    const { season, homeTeamId, awayTeamId, stepId } = req.query;

    if (season && homeTeamId && awayTeamId && stepId) {
        const teams = await teamsMgr.getTeams();
        const homeTeam = teams.find(t => t.Id == parseInt(homeTeamId));
        const awayTeam = teams.find(t => t.Id == parseInt(awayTeamId));

        const step = await teamsMgr.getStep(parseInt(stepId));

        const maxPlayers = MAX_PLAYER_LINES - MIN_EMPTY_LINES;
        // var homePlayers = await playersMgr.getPlayers(parseInt(season), parseInt(homeTeamId), parseInt(stepId), [1]);
        // homePlayers = addEmptyPlayerLines(homePlayers ? mapPlayers(homePlayers) : []);
        const homePlayers = await getPlayers(parseInt(season), parseInt(homeTeamId), parseInt(stepId), [1], maxPlayers, true);
        const homeStaff = await getPlayers(parseInt(season), parseInt(homeTeamId), parseInt(stepId), [2, 3, 4, 5, 6]);

        // var awayPlayers = await playersMgr.getPlayers(parseInt(season), parseInt(awayTeamId), parseInt(stepId), [1]);
        // awayPlayers = addEmptyPlayerLines(awayPlayers ? mapPlayers(awayPlayers) : []);
        const awayPlayers = await getPlayers(parseInt(season), parseInt(awayTeamId), parseInt(stepId), [1], maxPlayers, true);
        const awayStaff = await getPlayers(parseInt(season), parseInt(awayTeamId), parseInt(stepId), [2, 3, 4, 5, 6]);
        
        const data = {
            homeTeam: homeTeam.ShortDescription,
            awayTeam: awayTeam.ShortDescription,
            step: step.Description,
            homePlayers: homePlayers,
            homeStaff1: homeStaff ? homeStaff.slice(0,2).map(p => { return { name: formatName(p.person.Name.toLowerCase(), 3), role: p.role.Description}; }) : [],
            homeStaff2: homeStaff ? homeStaff.slice(2,4).map(p => { return { name: formatName(p.person.Name.toLowerCase(), 3), role: p.role.Description}; }) : [],
            awayPlayers: awayPlayers,
            awayStaff1: awayStaff ? awayStaff.slice(0,2).map(p => { return { name: formatName(p.person.Name.toLowerCase(), 3), role: p.role.Description}; }) : [],
            awayStaff2: awayStaff ? awayStaff.slice(2,4).map(p => { return { name: formatName(p.person.Name.toLowerCase(), 3), role: p.role.Description}; }) : []
        };

        try {
            const basePath = path.join(__dirname, '..', 'public' + path.sep);
            //console.log('Base path: ', basePath);

            const compiledFunction = pug.compileFile('./views/game_sheet.pug');
            const result = compiledFunction(data);

            var options = {
                format: 'A4',
                orientation: "landscape",
                base: "file:///" + basePath,
                border: "8mm"
            };

            pdf.create(result, options).toBuffer(function (err, buffer) {
                if (err) { 
                    return console.log(err); 
                }
                const src = "data:application/pdf;base64," + btoa(buffer);
                res.send({ src: src });
            });

            // pdf.create(result, options).toFile(path.join(basePath, 'doc/game_sheet.pdf'), function (err, result) {
            //     if (err) { 
            //         return console.log(err); 
            //     }

            //     console.log('Generated PDF: ', result);
            //     // const src = "data:application/pdf;base64," + btoa(fs.readFileSync(result.filename));
            //     // res.send({ src: src });
            // });

            //res.render('game_sheet', data);
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

async function getPlayers(season, teamId, stepId, roles, maxElements = 9999, addEmptyLines = false) {
    var players = await playersMgr.getPlayers(season, teamId, stepId, roles);
    if (players && players.length > maxElements) {
        players.splice(maxElements, players.length);
    }

    if (addEmptyLines) {
        players = addEmptyPlayerLines(players ? mapPlayers(players) : []);
    }
    return players;
}

function addEmptyPlayerLines(arr) {
    if (arr && arr.length) {
        for(var i = arr.length /*, j = arr.length */; i < MAX_PLAYER_LINES /* && i - j < MAX_EMPTY_LINES*/; i++) {
            arr.push({ });
        }
    }
    return arr;
}

function formatName(val, nrNames = 4, totalLetters = 24) {
    var name = val.toLowerCase();
    var names = name.split(' ');

    //limit nr of names
    while(names.length > nrNames) {
        names.splice(2, 1);
    }

    //Limit total name length
    while(names.reduce((p, a) => p + a.length, 0) > totalLetters) {
        names.splice(1, 1);
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

module.exports = {
    teamTemplate,
    gameTemplate
}

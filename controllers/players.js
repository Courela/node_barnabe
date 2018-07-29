const errors = require('../errors');
const playersMgr = require('../managers/players');
const { isValidGender, isValidEmail, isValidPhone, isValidDate } = require('../utils/validations');

async function getTeamPlayers(req, res) {
    let response = '';
    try {
        //console.log('Route params: ', req.params);
        const { season, teamId, stepId } = req.params;
        if (season && teamId && stepId) {
            response = await playersMgr.getPlayers(
                parseInt(season),
                parseInt(teamId),
                parseInt(stepId),
                [1]);
        }
        else {
            res.statusCode = 400;
        }
    }
    catch (err) {
        console.error(err);
        errors.handleErrors(res);
        response = err;
    }
    if (!response) {
        res.statusCode = 404;
    }
    res.send(response);
}

async function getStaff(req, res) {
    let response = '';
    try {
        //console.log('Route params: ', req.params);
        const { season, teamId, stepId } = req.params;
        if (season && teamId && stepId) {
            response = await playersMgr.getPlayers(
                parseInt(season),
                parseInt(teamId),
                parseInt(stepId),
                [2, 3, 4, 5, 6]);
        }
        else {
            res.statusCode = 400;
        }
    }
    catch (err) {
        console.error(err);
        errors.handleErrors(res);
        response = err;
    }
    res.send(response);
}

async function getPlayer(req, res) {
    console.log('GetPlayer: ', req.params);
    let response = '';
    try {
        const { teamId, stepId, season, playerId } = req.params;
        if (teamId && stepId && season && playerId) {
            response = await playersMgr.getPlayer(parseInt(season), parseInt(teamId), parseInt(stepId), parseInt(playerId));
            //console.log(response);
            if (!response) { res.statusCode = 404 }
        } else {
            res.statusCode = 400;
        }
    }
    catch (err) {
        console.error(err);
        errors.handleErrors(res);
        response = err;
    }
    res.send(response);
}

async function addPlayer(req, res) {
    let response = '';
    try {
        console.log('AddPlayer params: ', req.params);
        console.log('AddPlayer: ', req.body);
        const { teamId, stepId, season } = req.params;
        const { person, caretaker, role, photo, doc, comments } = req.body;

        if (season && teamId && stepId && role && isPersonValid(person) && isCaretakerValid(caretaker)) {
            const playerId = await playersMgr.addPlayer(
                parseInt(teamId),
                parseInt(stepId),
                parseInt(season),
                person,
                parseInt(role),
                caretaker,
                comments,
                photo,
                doc
            );
            if (playerId > 0) {
                res.statusCode = 201;
                console.log('PlayerId: ' + playerId);
                response = { Id: playerId };
            } else {
                const result = Math.abs(playerId);
                console.log('Status code result: ' + result);
                res.statusCode = result;
            }
        } else {
            console.log('Bad request!');
            res.statusCode = 400;
        }
    }
    catch (err) {
        console.error(err);
        errors.handleErrors(res);
        response = err;
    }
    res.send(response);
}

async function updatePlayer(req, res) {
    let response = '';
    try {
        //console.log('updatePlayer params: ', req.params);
        //console.log('updatePlayer: ', req.body.player);

        const { teamId, stepId, season, playerId } = req.params;
        const { person, caretaker } = req.body;
        const { roleId, comments, doc, photo } = req.body.player;

        if (person.id && teamId && stepId && season && isPersonValid(person) && isCaretakerValid(caretaker)) {
            await playersMgr.updatePlayer(
                parseInt(teamId),
                parseInt(stepId),
                parseInt(season),
                parseInt(playerId),
                person,
                parseInt(roleId),
                caretaker,
                comments,
                photo,
                doc
            );
            if (playerId > 0) {
                res.statusCode = 200;
                console.log('PlayerId: ' + playerId);
                response = { Id: playerId };
            } else {
                const result = Math.abs(playerId);
                console.log('Status code result: ' + result);
                res.statusCode = result;
            }
        } else {
            console.log('Bad request!');
            res.statusCode = 400;
        }
    }
    catch (err) {
        console.error(err);
        errors.handleErrors(res);
        response = err;
    }
    res.send(response);
}

async function removePlayer(req, res) {
    const { season, teamId, stepId, playerId } = req.params;
    if (teamId && stepId && season && playerId) {
        await playersMgr.removePlayer(
            parseInt(teamId),
            parseInt(stepId),
            parseInt(season),
            parseInt(playerId)
        );
    }
    else {
        res.statusCode = 400;
    }

    res.send();
}

async function importPlayers(req, res) {
    const { season, teamId, stepId } = req.params;
    const { selectedSeason, playerIds } = req.body;
    if (teamId && stepId && season && selectedSeason && playerIds) {
        if (playerIds.length > 0) {
            await playersMgr.importPlayers(
                parseInt(teamId),
                parseInt(stepId),
                parseInt(season),
                parseInt(selectedSeason),
                playerIds
            );
        }
    }
    else {
        res.statusCode = 400;
    }

    res.send();
}

function isPersonValid(person) {
    let result = false;
    if (person) {
        const { name, gender, birth, docId, email, phoneNr } = person;
        result = name && docId &&
            isValidDate(birth) &&
            isValidGender(gender) &&
            isValidEmail(email) &&
            isValidPhone(phoneNr);
    }
    return result;
}

function isCaretakerValid(caretaker) {
    let result = false;
    if (caretaker) {
        const { name, docId, email, phoneNr } = caretaker;
        result = name && docId &&
            isValidEmail(email) &&
            isValidPhone(phoneNr);
    }
    else { result = true; }
    return result;
}

module.exports = {
    getTeamPlayers,
    getStaff,
    addPlayer,
    getPlayer,
    updatePlayer,
    removePlayer,
    importPlayers
}
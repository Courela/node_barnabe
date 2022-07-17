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
        errors.handleErrors(res, err);
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
        errors.handleErrors(res, err);
        response = err;
    }
    res.send(response);
}

async function getPlayer(req, res) {
    //console.log('GetPlayer: ', req.params);
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
        errors.handleErrors(res, err);
        response = err;
    }
    res.send(response);
}

async function addPlayer(req, res) {
    let response = '';
    try {
        const { teamId, stepId, season } = req.params;
        const { Person, Caretaker, RoleId, Photo, Doc, Comments, Resident } = req.body;

        if (season && teamId && stepId && RoleId && isPersonValid(Person) && isCaretakerValid(Caretaker)) {
            const playerId = await playersMgr.addPlayer(
                parseInt(teamId),
                parseInt(stepId),
                parseInt(season),
                Person,
                parseInt(RoleId),
                Caretaker,
                Comments,
                Resident,
                Photo,
                Doc
            );
            if (playerId > 0) {
                res.statusCode = 201;
                //console.log('PlayerId: ' + playerId);
                response = { Id: playerId };
            } else {
                const result = Math.abs(playerId);
                //console.log('Status code result: ' + result);
                res.statusCode = result;
            }
        } else {
            console.log('Bad request!');
            res.statusCode = 400;
        }
    }
    catch (err) {
        errors.handleErrors(res, err);
        response = err;
    }

    //TODO Remove when saving data handled properly
    //googleApi.saveData();

    res.send(response);
}

async function updatePlayer(req, res) {
    let response = '';
    try {
        const { teamId, stepId, season, playerId } = req.params;
        const { Person, Caretaker, RoleId, Comments, doc, Photo, Resident } = req.body;

        if (teamId && stepId && season && isPersonValid(Person, RoleId) && Person.Id && isCaretakerValid(Caretaker)) {
            await playersMgr.updatePlayer(
                parseInt(teamId),
                parseInt(stepId),
                parseInt(season),
                parseInt(playerId),
                Person,
                parseInt(RoleId),
                Caretaker,
                Comments,
                Resident,
                Photo,
                doc
            );
            if (playerId > 0) {
                res.statusCode = 200;
                //console.log('PlayerId: ' + playerId);
                response = { Id: playerId };
            } else {
                const result = Math.abs(playerId);
                //console.log('Status code result: ' + result);
                res.statusCode = result;
            }
        } else {
            console.log('Bad request!');
            res.statusCode = 400;
        }
    }
    catch (err) {
        errors.handleErrors(res, err);
        response = err;
    }
    
    //TODO Remove when saving data handled properly
    //googleApi.saveData();

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

    //TODO Remove when saving data handled properly
    //googleApi.saveData((result) => res.json(result));

    res.send();
}

async function importPlayers(req, res) {
    const { season, teamId, stepId } = req.params;
    const { selectedSeason, playerIds } = req.body;
    var count = 0;
    if (teamId && stepId && season && selectedSeason && playerIds) {
        if (playerIds.length > 0) {
            count = await playersMgr.importPlayers(
                parseInt(teamId),
                parseInt(stepId),
                parseInt(season),
                parseInt(selectedSeason),
                playerIds
            );
        }
        res.json({ Imported: count, Total: playerIds.length }); 
    }
    else {
        res.statusCode = 400;
    }

    //console.log('Imported players: ', count);
    //TODO Remove when saving data handled properly
    // googleApi.saveData((result) => {
    //     console.log(result); 
    //     res.json({ imported: count, save: result }); 
    //     res.send();
    // });
    
    res.send();
}

async function getPhoto(req, res) {
    let response = '';
    try {
        const { teamId, stepId, season, playerId } = req.params;
        if (teamId && stepId && season && playerId) {
            response = await playersMgr.getLocalPhoto(parseInt(season), parseInt(teamId), parseInt(stepId), parseInt(playerId));
            //console.log(response);
            if (!response) { res.statusCode = 404 }
        } else {
            res.statusCode = 400;
        }
    }
    catch (err) {
        errors.handleErrors(res, err);
        response = err;
    }
    res.send(response);
}

function isPersonValid(person, roleId) {
    var result = false;
    if (person) {
        const { Name, Gender, Birthdate, IdCardNr, Email, Phone } = person;
        result = Name && IdCardNr &&
            (roleId > 1 || isValidDate(Birthdate)) &&
            isValidGender(Gender) &&
            isValidEmail(Email) &&
            isValidPhone(Phone);
    }
    return result;
}

function isCaretakerValid(caretaker) {
    var result = false;
    if (caretaker) {
        const { Name, IdCardNr, Email, Phone } = caretaker;
        result = Name && IdCardNr &&
            isValidEmail(Email) &&
            isValidPhone(Phone);
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
    importPlayers,
    getPhoto
}
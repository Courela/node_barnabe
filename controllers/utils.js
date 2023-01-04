const utilsMgr = require('../managers/utils');
const personMgr = require('../managers/person');

async function getRoles (req, res) {
    const result = await utilsMgr.getRoles();
    res.send(result);
}

async function getSeasons (req, res) {
    const result = await utilsMgr.getSeasons();
    res.send(result);
}

async function getSeason (req, res) {
    const season = parseInt(req.params.season);
    const seasons = await utilsMgr.getSeasons();
    const result = seasons.find(s => s.Year == season);
    res.send(result);
}

async function getSteps (req, res) {
    const result = await utilsMgr.getSteps();
    res.send(result);
}

async function getPerson (req, res) {
    var result;
    const idCardNr = req.query.idCardNr;
    const multiple = !!req.query.multiple;
    if (idCardNr) {
        result = await personMgr.getPersonByIdCardNr(idCardNr);
        if (multiple) {
            result ? result : [];
        }
    } else {
        res.statusCode = 400;
    }
    res.send(result);
}

async function getPhases (_, res) {
    const result = await utilsMgr.getPhases();
    res.send(result);
}

module.exports = {
    getRoles,
    getSeasons,
    getSeason,
    getSteps,
    getPhases,
    getPerson
}
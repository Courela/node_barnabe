const stepsMgr = require("../managers/steps");
const errors = require('../errors');

async function getStandings(req, res) {
    const season = req.query.season;
    const stepId = req.query.stepId;
    const results = [{
        position: 1,
        teamId: 2,
        teamName: 'Aruil',
        points: 10,
        goalsScored: 4,
        goalsConceded: 5,
        avg: -1
    }];
    res.send(results);
}

async function getMatches(req, res) {
    const season = req.params.season;
    const stepId = req.params.stepId;

    var result;
    try {
        result = await stepsMgr.getMatches(season, stepId);
    } catch (err) {
        errors.handleErrors(res, err);
        result = err;
    }
    res.send(result);
}

async function addMatch(req, res) {
    const { season, stepId } = req.params;
    const { phase, homeTeamId, awayTeamId, homeTeamGoals, awayTeamGoals } = req.body;
    
    var result;
    try {
        result = await stepsMgr.insertMatch(
            parseInt(season, 10), 
            parseInt(stepId, 10), 
            parseInt(phase, 10), 
            parseInt(homeTeamId, 10), 
            parseInt(awayTeamId, 10), 
            parseInt(homeTeamGoals, 10), 
            parseInt(awayTeamGoals, 10));
        console.log('Match added: ', req.params, req.body);
    } catch (err) {
        errors.handleErrors(res, err);
        result = err;
    }
    res.send(result);
}

async function removeMatch(req, res) {
    const { matchId, season, stepId } = req.params;
    if (matchId && season && stepId) {
        try {
            await stepsMgr.removeMatch(matchId, season, stepId);
        } catch (err) {
            errors.handleErrors(res, err);
            result = err;
        }
    } else {
        res.statusCode = 400;
    }
    res.send();
}

module.exports = {
    getMatches,
    getStandings,
    addMatch,
    removeMatch
}
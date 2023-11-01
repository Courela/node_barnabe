const stepsMgr = require("../managers/steps");
const errors = require('../errors');

async function getStandings(req, res) {
    const { season, stepId, phaseId } = req.params;
    var results;
    if (season && stepId, phaseId) {
        try {
            results = await stepsMgr.getStandings(season, stepId, phaseId)
        } catch(err) {
            errors.handleErrors(res, err);
            results = err;
        }
    } else {
        res.statusCode = 400;
    }
    res.send(results);
}

async function getMatches(req, res) {
    const { season, stepId, phaseId } = req.params;
    var result;
    if (season && stepId, phaseId) {
        try {
            result = await stepsMgr.getMatches(season, stepId, phaseId);
        } catch (err) {
            errors.handleErrors(res, err);
            result = err;
        } 
    } else {
        res.statusCode = 400;
    }
    res.send(result);
}

async function addMatch(req, res) {
    var { season, stepId } = req.params;
    var { date, phase: phaseId, group, matchday, homeTeamId, awayTeamId, homeTeamGoals, awayTeamGoals } = req.body;
    
    var result;
    try {
        season = parseInt(season, 10);
        stepId = parseInt(stepId, 10);
        date = date.substring(0, 10);
        phaseId = parseInt(phaseId, 10);
        homeTeamId = parseInt(homeTeamId, 10);
        awayTeamId = parseInt(awayTeamId, 10);
        
        var match = await stepsMgr.getMatch(season, stepId, date, phaseId, homeTeamId, awayTeamId);
        if (!match || match.length == 0) {
            result = await stepsMgr.insertMatch(
                season,
                stepId,
                date,
                phaseId, 
                group,
                matchday,
                homeTeamId, 
                awayTeamId, 
                parseInt(homeTeamGoals, 10), 
                parseInt(awayTeamGoals, 10));
            if (typeof result === 'boolean') {
                console.log('Match added: ', req.params, req.body);
            } else {
                console.warn(result);
                res.statusCode = 400;
            }
        } else {
            result = errors.createErrorData('Duplicated match', 'Jogo já existe.');
            res.statusCode = 409;
        }
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
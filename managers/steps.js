const stepsRepo = require('../repositories/steps');
const teamsMgr = require('../managers/teams');
const proc = require("child_process");

function insertMatch(season, stepId, phaseId, homeTeamId, awayTeamId, homeTeamGoals, awayTeamGoals) {
    return stepsRepo.insertMatch(season, stepId, phaseId, homeTeamId, awayTeamId, homeTeamGoals, awayTeamGoals)
        .then(r => r && r.rowsAffected > 0)
        .catch((err) => {
            //console.error(err);
            throw err;
        });
}

function getMatches(season, stepId, phaseId) {
    return stepsRepo.getMatches(season, stepId, phaseId != 99 ? phaseId : null)
        .then((results) => results.recordset)
        .catch((err) => {
            //console.error(err);
            throw err;
        });
}

function removeMatch(matchId, season, stepId) {
    return stepsRepo.removeMatch(matchId, season, stepId)
        .then((results) => {
            if (!results || !results.rowsAffected || results.rowsAffected < 1) {
                throw 'Unexpected error!';
            }
        })
        .catch((err) => {
            //console.error(err);
            throw err;
        });
    }
    
    async function getStandings(season, stepId, phaseId) {
        var result = await stepsRepo.getMatches(season, stepId, phaseId)
            .then(async (matches) => {
                if (!matches || !matches.recordset) {
                    throw 'Unexpected error!';
                }
                
                return await calculateStandings(matches.recordset);
            })
            .catch((err) => {
                //console.error(err);
                throw err;
            });
    return result;
}

async function calculateStandings(matches) {
    var standings = [];
    for (let index = 0; index < matches.length; index++) {
        const m = matches[index];
        
        var homeTeam = standings.find(t => t.TeamId === m.HomeTeamId);
        var awayTeam = standings.find(t => t.TeamId === m.AwayTeamId);
        if (!homeTeam) {
            var team = await teamsMgr.getTeamById(m.HomeTeamId);
            homeTeam = getTeamObj(team);
            standings.push(homeTeam);
        }
        if (!awayTeam) {
            var team = await teamsMgr.getTeamById(m.AwayTeamId);
            awayTeam = getTeamObj(team);
            standings.push(awayTeam);
        }
        
        if (m.HomeTeamGoals > m.AwayTeamGoals) {
            homeTeam.Points = homeTeam.Points + 3;
        } else if (m.HomeTeamGoals < m.AwayTeamGoals) {
            awayTeam.Points = awayTeam.Points + 3;
        } else {
            homeTeam.Points = homeTeam.Points + 1;
            awayTeam.Points = awayTeam.Points + 1;
        }
        homeTeam.GoalsScored = homeTeam.GoalsScored + m.HomeTeamGoals;
        homeTeam.GoalsConceded = homeTeam.GoalsConceded + m.AwayTeamGoals;
        homeTeam.Avg = homeTeam.GoalsScored - homeTeam.GoalsConceded;

        awayTeam.GoalsScored = awayTeam.GoalsScored + m.AwayTeamGoals;
        awayTeam.GoalsConceded = awayTeam.GoalsConceded + m.HomeTeamGoals;
        awayTeam.Avg = awayTeam.GoalsScored - awayTeam.GoalsConceded;
    };

    return assignPositions(standings);
}

function assignPositions(standings) {
    var result = standings.sort((a,b) => (b.Points - a.Points) * 10000 + (b.Avg - a.Avg) * 100 + (b.GoalsScored - a.GoalsScored));
    for (let index = 0; index < standings.length; index++) {
        const element = standings[index];
        element['Position'] = index + 1;
    }
    return result;
}

function getTeamObj(team) {
    return {
        TeamId: team.Id,
        TeamName: team.ShortDescription,
        Points: 0,
        GoalsScored: 0,
        GoalsConceded: 0,
        Avg: 0
    }
}
module.exports = {
    insertMatch,
    getMatches,
    removeMatch,
    getStandings
}
const db = require('../db/adapter');

function getTeams() {
    return db.getMultiple('Team');
}

function getTeamsBySeason(season) {
    const query = ' SELECT DISTINCT t.* FROM TeamStep ts ' +
        '   INNER JOIN Team t ON t.Id = ts.TeamId ' +
        ' WHERE ts.season = @season';
    const parameters = [{
        name: 'season',
        type: db.sql_int,
        value: season
    }];
    return db.selectQuery(query, parameters);
}

function getTeamSteps(season, teamId) {
    const query = ' SELECT ts.*, s.Description FROM TeamStep ts ' +
        '   INNER JOIN Step s ON s.Id = ts.StepId ' +
        ' WHERE ts.TeamId = @teamId AND ts.Season = @season';
    const parameters = [{
        name: 'teamId',
        type: db.sql_int,
        value: teamId
    },{
        name: 'season',
        type: db.sql_smallint,
        value: season
    }];
    return db.selectQuery(query, parameters);
}

function addStep(season, teamId, stepId) {
    const query = ' INSERT INTO dbo.TeamStep (TeamId, StepId, Season) ' +
        ' VALUES (@teamId, @stepId, @season) ';
        const parameters = [{
            name: 'teamId',
            type: db.sql_int,
            value: teamId
        },{
            name: 'stepId',
            type: db.sql_smallint,
            value: stepId
        },{
            name: 'season',
            type: db.sql_int,
            value: season
        }];
        return db.selectQuery(query, parameters);
}

module.exports = {
    addStep,
    getTeams,
    getTeamsBySeason,
    getTeamSteps
}

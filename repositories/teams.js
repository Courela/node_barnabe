const db = require('../db/adapter');

function getTeams() {
    return db.getMultiple('Team');
}

function getTeamsBySeason(season) {
    const query = ' SELECT DISTINCT t.* FROM Team t ' +
        '   INNER JOIN TeamStep ts ON ts.TeamId = t.Id AND ts.season = @season ;';
    const parameters = [{
        name: 'season',
        type: db.sql_int,
        value: season
    }];
    return db.statementQuery(query, parameters);
}

function getTeamSteps(season, teamId, invert = false) {
    const query = ' SELECT s.Id, s.Description, s.Gender ' +
        '   ,ts.TeamId, ts.StepId, ts.Season ' + 
        ' FROM Step s ' +
        '   LEFT JOIN TeamStep ts ON ts.StepId = s.Id AND ts.TeamId = @teamId AND ts.Season = @season ' +
        ' WHERE ' + (invert ? ' ts.Id IS NULL ' : 'ts.Id IS NOT NULL; ');
    const parameters = [{
        name: 'teamId',
        type: db.sql_int,
        value: teamId
    },{
        name: 'season',
        type: db.sql_smallint,
        value: season
    }];
    return db.statementQuery(query, parameters);
}

function getStep(stepId) {
    return db.getSingle('Step', stepId);
}

function addStep(season, teamId, stepId) {
    const query = ' INSERT INTO dbo.TeamStep (TeamId, StepId, Season) ' +
        ' VALUES (@teamId, @stepId, @season); ';
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
        return db.statementQuery(query, parameters);
}

module.exports = {
    addStep,
    getStep,
    getTeams,
    getTeamsBySeason,
    getTeamSteps
}

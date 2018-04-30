const db = require('./operator');

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

function getTeamSteps(teamId) {
    const query = ' SELECT ts.*, s.Description FROM TeamStep ts ' +
        '   INNER JOIN Step s ON s.Id = ts.StepId ' +
        ' WHERE ts.TeamId = @teamId';
    const parameters = [{
        name: 'teamId',
        type: db.sql_int,
        value: teamId
    }];
    return db.selectQuery(query, parameters);
}

module.exports = {
    getTeamsBySeason,
    getTeamSteps
}

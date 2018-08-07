const mysql = require('../db/mysql');

function getTeamSteps(season, teamId, invert = false) {
    return (!invert ? 
        mysql.executeStatement('SELECT StepId, TeamId, Season ' +
            ' FROM teamstep ' +
            ' WHERE season = ? AND teamId = ? ;', [season, teamId]) :
        mysql.executeStatement('SELECT s.Id, null AS TeamId, ? AS Season ' +
            ' FROM step s' +
                ' LEFT JOIN teamstep ts ON ts.StepId = s.Id AND ts.Season = ? AND ts.TeamId = ? ' +
            ' WHERE ts.StepId IS NULL ;', [season, season, teamId]))
            .then(results => { return { recordset: results, rowsAffected: [results.length] }});
}

function addStep(season, teamId, stepId) {
    return mysql.executeStatement('INSERT INTO teamstep (TeamId, StepId, Season) ' + 
        'VALUES (?, ?, ?);', [teamId, stepId, season])
        .then(res => { return { rowsAffected: [res.affectedRows] }; })
        .catch((err) => {
            if (err.code === 'ER_DUP_ENTRY') {
                console.warn('Duplicated entry:', err);
                return { rowsAffected: [0] };
            }
            else { throw err; }
        });
}

function deleteStep(season, teamId, stepId) {
    return mysql.executeStatement('DELETE FROM teamstep ' +
        ' WHERE teamId = ? AND stepId = ? AND season = ?',[teamId, stepId, season])
        .then(res => { return { rowsAffected: [res.affectedRows] }; });
}

function getTeams() {
    return mysql.executeStatement('SELECT * FROM team')
        .then(res => { return { recordset: res, rowsAffected: [res.length] }; });
}

function getSteps() {
    return mysql.executeStatement('SELECT * FROM step')
        .then(result => {
            return { recordset: result, rowsAffected: [result.length] };
        });
}

function getStep(stepId, season = null) {
    return mysql.executeStatement('SELECT s.Id, s.Description, s.Gender, s.IsCaretakerRequired, ' +
                ' b.Season, b.MinDate, b.MaxDate ' +
            ' FROM step s ' + 
                ' LEFT JOIN birthsteplimit b on b.StepId = s.Id AND b.season = COALESCE(?, b.season) ' +
            ' WHERE s.Id = ? ;',
            [season ? season : 'null', stepId])
        .then(res => { return { recordset: res, rowsAffected: [res.length] }; });
}

function getTeamsBySeason(season) {
    return mysql.executeStatement(' SELECT t.Id, ts.Season ' + 
            ' FROM team t ' +
                ' INNER JOIN teamstep ts ON ts.TeamId = t.Id AND ts.Season = ? ' +
            ' GROUP BY t.Id, ts.Season ', [season] )
        .then(res => { return { recordset: res, rowsAffected: [res.length] }; });
}

module.exports = {
    addStep,
    getStep,
    getSteps,
    getTeams,
    getTeamsBySeason,
    getTeamSteps,
    deleteStep
}

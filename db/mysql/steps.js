const mysql = require('mysql2');
const adapter = require('../mysql');

function insertMatch(season, stepId, phaseId, homeTeamId, awayTeamId, homeTeamGoals, awayTeamGoals, callback) {
    var q = " INSERT INTO `match` (Season, StepId, PhaseId, HomeTeamId, AwayTeamId, HomeTeamGoals, AwayTeamGoals, CreatedAt, LastUpdatedAt) " + 
            " VALUES (" + mysql.escape(season) + ", " + 
                          mysql.escape(stepId) + ", " + 
                          mysql.escape(phaseId) + ", " + 
                          mysql.escape(homeTeamId) + ", " + 
                          mysql.escape(awayTeamId) + ", " + 
                          mysql.escape(homeTeamGoals) + ", " +
                          mysql.escape(awayTeamGoals) + ", " +
                    " CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()) ";
    adapter.query(q, callback);
}

function getMatches(season, stepId, callback) {
    var q = " SELECT m.Id, m.Season, m.StepId, m.PhaseId, m.HomeTeamId, m.AwayTeamId, m.HomeTeamGoals, m.AwayTeamGoals, " +
            "   p.Name AS PhaseName, " +
            "   t1.ShortDescription AS HomeTeamName, t2.ShortDescription AS AwayTeamName " +
            " FROM `match` m " +
            "   INNER JOIN phase p ON p.Id = m.PhaseId " +
            "   INNER JOIN team t1 ON t1.Id = m.HomeTeamId " +
            "   INNER JOIN team t2 ON t2.Id = m.AwayTeamId " + 
            " WHERE m.Season = " + mysql.escape(season) +
            "   AND m.StepId = " + mysql.escape(stepId);
    adapter.query(q, callback);
}

function deleteMatch(matchId, season, stepId, callback) {
    var q = " DELETE FROM `match` " +
            " WHERE Id = " + mysql.escape(matchId) +
            "   AND Season = " + mysql.escape(season) +
            "   AND StepId = " + mysql.escape(stepId);
    adapter.query(q, callback);
}

module.exports = {
    insertMatch,
    getMatches,
    deleteMatch
}
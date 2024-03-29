const mysql = require('mysql2');
const adapter = require('../mysql');

function insertMatch(season, stepId, date, phaseId, group, matchday, homeTeamId, awayTeamId, homeTeamGoals, awayTeamGoals, callback) {
    var q = " INSERT INTO `match` (Season, StepId, PhaseId, `Date`, `Group`, Matchday, HomeTeamId, AwayTeamId, HomeTeamGoals, AwayTeamGoals, CreatedAt, LastUpdatedAt) " + 
            " VALUES (" + mysql.escape(season) + ", " + 
                          mysql.escape(stepId) + ", " + 
                          mysql.escape(phaseId) + ", " + 
                          mysql.escape(date) + ", " + 
                          (group ? mysql.escape(group) : "NULL") + ", " +
                          (matchday ? mysql.escape(matchday) : "NULL") + ", " +  
                          mysql.escape(homeTeamId) + ", " + 
                          mysql.escape(awayTeamId) + ", " + 
                          mysql.escape(homeTeamGoals) + ", " +
                          mysql.escape(awayTeamGoals) + ", " +
                    " CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()) ";
    adapter.query(q, callback);
}

function getMatches(season, stepId, phaseId, callback) {
    var q = " SELECT m.Id, m.Season, m.StepId, m.Date, m.PhaseId, m.Group, m.Matchday, m.HomeTeamId, m.AwayTeamId, m.HomeTeamGoals, m.AwayTeamGoals, " +
            "   p.Name AS PhaseName, " +
            "   t1.ShortDescription AS HomeTeamName, t2.ShortDescription AS AwayTeamName " +
            " FROM `match` m " +
            "   INNER JOIN phase p ON p.Id = m.PhaseId " +
            "   INNER JOIN team t1 ON t1.Id = m.HomeTeamId " +
            "   INNER JOIN team t2 ON t2.Id = m.AwayTeamId " + 
            " WHERE m.Season = " + mysql.escape(season) +
            "   AND m.StepId = " + mysql.escape(stepId) +
            "   AND m.PhaseId = COALESCE(" + mysql.escape(phaseId) + ",m.PhaseId)";
    adapter.query(q, callback);
}

function getMatch(season, stepId, date, phaseId, group, homeTeamId, awayTeamId, callback) {
    var q = " SELECT m.Id, m.Season, m.StepId, m.Date, m.PhaseId, m.Group, m.Matchday, m.HomeTeamId, m.AwayTeamId, m.HomeTeamGoals, m.AwayTeamGoals, " +
            "   p.Name AS PhaseName, " +
            "   t1.ShortDescription AS HomeTeamName, t2.ShortDescription AS AwayTeamName " +
            " FROM `match` m " +
            "   INNER JOIN phase p ON p.Id = m.PhaseId " +
            "   INNER JOIN team t1 ON t1.Id = m.HomeTeamId " +
            "   INNER JOIN team t2 ON t2.Id = m.AwayTeamId " + 
            " WHERE m.Season = " + mysql.escape(season) +
            "   AND m.StepId = " + mysql.escape(stepId) +
            "   AND m.Date = " + mysql.escape(date) +
            "   AND m.PhaseId = COALESCE(" + mysql.escape(phaseId) + ",m.PhaseId)" +
            "   AND m.Group = COALESCE(" + mysql.escape(group) + ",m.Group)" +
            "   AND m.HomeTeamId = " + mysql.escape(homeTeamId) +
            "   AND m.AwayTeamId = " + mysql.escape(awayTeamId);
    console.log("Query:", q);
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
    getMatch,
    deleteMatch
}
const mysql = require('mysql');
const adapter = require('../mysql');

function getTeams(callback) {
    var q = " SELECT * FROM team";
    adapter.query(q, callback);
}

function getTeamById(id, callback) {
    var q = " SELECT * FROM team " +
            " WHERE Id = " + mysql.escape(id);
    adapter.query(q, callback);
}

function getTeamSteps(season, teamId, callback) {
    var q = " SELECT * FROM teamstep st " + 
            "   INNER JOIN team t ON t.Id = st.TeamId AND t.Id = " + mysql.escape(teamId) + 
            "   INNER JOIN season s ON s.Year = st.Season AND s.Year = " + mysql.escape(season) + 
            "   INNER JOIN step stp ON stp.Id = st.StepId " +
            "   INNER JOIN birthsteplimit bsl ON bsl.Season = s.Year AND bsl.StepId = stp.Id ";
    adapter.query(q, callback);
}

function getTeamMissingSteps(season, teamId, callback) {
    var q = " SELECT st.Id, st.Description " + 
            " FROM step st" + 
            "   LEFT JOIN team t ON t.Id = " + mysql.escape(teamId) +
            "   LEFT JOIN teamstep ts ON ts.StepId = st.Id AND ts.TeamId = t.Id AND ts.Season = " + mysql.escape(season) +
            "   LEFT JOIN season s ON s.Year = ts.Season " +
            " WHERE ts.Id IS NULL ";
    adapter.query(q, callback);
}

function getTeamsBySeason(season, callback) {
    var q = " SELECT s.Year, ts.TeamId, t.Name, t.ShortDescription " + 
            " FROM teamstep ts " +
            "   INNER JOIN season s ON s.Year = ts.Season" +
            "   INNER JOIN team t ON t.Id = ts.TeamId " +
            " WHERE ts.Season = " + mysql.escape(season) +
            " GROUP BY s.Year, ts.TeamId, t.Name, t.ShortDescription";
    adapter.query(q, callback);
}

function getTeamsByStep(season, stepId, callback) {
    var q = " SELECT s.Year, ts.TeamId, t.Name, t.ShortDescription " + 
            " FROM teamstep ts " +
            "   INNER JOIN season s ON s.Year = ts.Season" +
            "   INNER JOIN team t ON t.Id = ts.TeamId " +
            " WHERE ts.Season = " + mysql.escape(season) +
            "   AND ts.StepId = " + mysql.escape(stepId) +
            " GROUP BY s.Year, ts.TeamId, t.Name, t.ShortDescription";
    adapter.query(q, callback);
}

function addStep(season, teamId, stepId, callback) {
    var q = " INSERT INTO teamstep (TeamId, StepId, Season, CreatedAt) " + 
            " VALUES (" + mysql.escape(teamId) + "," +
                         mysql.escape(stepId) + "," +
                         mysql.escape(season) + "," +
                         "CURRENT_TIMESTAMP())";
    adapter.query.query(q, callback);
}

function deleteStep(season, teamId, stepId, callback) {
    var q = " DELETE FROM teamstep " + 
            " WHERE Season = " + mysql.escape(season) +
            "   AND TeamId = " + mysql.escape(teamId) +
            "   AND StepId = " + mysql.escape(stepId);
    adapter.query(q, callback);
}

function getStepById(stepId, callback) {
    var q = " SELECT * FROM step " +
            " WHERE Id = " + mysql.escape(stepId);
    adapter.query(q, callback);
}

function getStepWithSeason(stepId, season, callback) {
    var q = " SELECT * FROM step st " +
            "   INNER JOIN birthsteplimit bsl ON bsl.StepId = st.Id AND bsl.Season = "+ mysql.escape(season) +
            " WHERE st.Id = " + mysql.escape(stepId);
    adapter.query(q, callback);
}

module.exports = {
    getTeams,
    getTeamById,
    getTeamSteps,
    getTeamMissingSteps,
    getTeamsBySeason,
    getTeamsByStep,
    addStep,
    deleteStep,
    getStepById,
    getStepWithSeason
}
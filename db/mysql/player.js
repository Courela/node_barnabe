const mysql = require('mysql');
const adapter = require('../mysql');

function getPlayers (season, teamId, stepId, roles, callback) {
    var q = " SELECT p.*, " +
            "     ps.Name AS PlayerName, ps.Gender AS PlayerGender, ps.Birthdate AS PlayerBirthdate, ps.IdCardNr AS PlayerIdCardNr, " +
            "     r.Description AS RoleDescription, " +
            "     ct.Name AS CareTakerName, ct.IdCardNr AS CareTakerIdCardNr, ct.VoterNr AS CareTakerVoterNr, " +
            "     bsl.MinDate, bsl.MaxDate, " +
            "     s.Gender AS StepGender, s.IsCareTakerRequired AS StepIsCareTakerRequired " +
            " FROM player p " + 
            "   INNER JOIN step s ON s.Id = p.StepId AND s.Id = " + mysql.escape(stepId) +
            "   INNER JOIN team t ON t.Id = p.TeamId AND t.Id = " + mysql.escape(teamId) + 
            "   INNER JOIN person ps ON ps.Id = p.PersonId " +
            "   INNER JOIN role r ON r.Id = p.RoleId " +
            "   INNER JOIN birthsteplimit bsl ON bsl.StepId = s.Id AND bsl.Season = " + mysql.escape(season) +
            "   LEFT JOIN person ct ON ct.Id = p.CareTakerId " +
            " WHERE p.Season = " + mysql.escape(season) + 
            "   AND p.RoleId IN (" + roles.map((r, i) => mysql.escape(r)) + ")";
    adapter.query(q, callback);
}

function existsPlayer(season, teamId, stepId, roleId, personId, callback) {
    var q = " SELECT 1 FROM player p " + 
            " WHERE p.Season = " + mysql.escape(season) + 
            "   AND p.TeamId = " + mysql.escape(teamId) +
            "   AND p.StepId = " + mysql.escape(stepId) +
            "   AND p.RoleId = " + mysql.escape(roleId) +
            "   AND p.PersonId = " + mysql.escape(personId);
    adapter.query(q, callback);
}

function getPlayer(season, teamId, stepId, playerId, callback) {
    var q = " SELECT p.*, " +
            "     s.Description AS StepDescription, s.Gender AS StepGender, s.IsCaretakerRequired AS StepIsCaretakerRequired, bsl.MinDate AS StepMinDate, bsl.MaxDate AS StepMaxDate," +
            "     t.Name AS TeamName, t.ShortDescription AS TeamShortDescription, " +
            "     ps.Name AS PlayerName, ps.Gender AS PlayerGender, ps.Birthdate AS PlayerBirthdate, ps.IdCardNr AS PlayerIdCardNr, ps.VoterNr AS PlayerVoterNr, ps.LocalBorn AS PlayerLocalBorn, ps.LocalTown AS PlayerLocalTown, ps.Email AS PlayerEmail, ps.Phone AS PlayerPhone," +
            "     r.Description AS RoleDescription, " +
            "     ct.Name AS CareTakerName, ct.IdCardNr AS CareTakerIdCardNr, ct.VoterNr AS CareTakerVoterNr, ct.Email AS CareTakerEmail, ct.Phone AS CareTakerPhone " +
            " FROM player p " + 
            "   INNER JOIN step s ON s.Id = p.StepId AND s.Id = " + mysql.escape(stepId) +
            "   INNER JOIN birthsteplimit bsl ON bsl.StepId = s.Id AND bsl.Season = " + mysql.escape(season) +
            "   INNER JOIN team t ON t.Id = p.TeamId AND t.Id = " + mysql.escape(teamId) + 
            "   INNER JOIN person ps ON ps.Id = p.PersonId " +
            "   INNER JOIN role r ON r.Id = p.RoleId " +
            "   LEFT JOIN person ct ON ct.Id = p.CareTakerId " +
            " WHERE p.Id = " + mysql.escape(playerId) +
            "   AND p.Season = " + mysql.escape(season);
    adapter.query(q, callback);
}

function addPlayer(teamId, stepId, season, resident, personId, roleId, caretakerId, comments, callback) {
    var q = " INSERT INTO player (Season, TeamId, StepId, PersonId, Resident, RoleId, CareTakerId, Comments, CreatedAt, LastUpdatedAt) " + 
            " VALUES (" + mysql.escape(season) + ", " + 
                          mysql.escape(teamId) + ", " + 
                          mysql.escape(stepId) + ", " + 
                          mysql.escape(personId) + ", " + 
                          mysql.escape(resident) + ", " + 
                          mysql.escape(roleId) + ", " + 
                          mysql.escape(caretakerId) + ", " +
                          mysql.escape(comments) + ", " +
                    " CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()) ";
    adapter.query(q, callback);
}

function updatePlayer(id, caretakerId, comments, isResident, callback) {
    var q = " UPDATE player " + 
            " SET CareTakerId = " + mysql.escape(caretakerId) +
            "   , Comments = " + mysql.escape(comments) + 
            "   , Resident = " + mysql.escape(isResident) +
            "   , LastUpdatedAt = CURRENT_TIMESTAMP() " +
            " WHERE Id = " + mysql.escape(id);
    adapter.query(q, callback);
}

function removePlayer(teamId, stepId, season, playerId, callback) {
    var q = " DELETE FROM player " + 
            " WHERE Id = " + mysql.escape(playerId) +
            "     AND TeamId = " + mysql.escape(teamId) +
            "     AND StepId = " + mysql.escape(stepId) +
            "     AND Season = " + mysql.escape(season);
    adapter.query(q, callback);
}

function addPhoto(playerId, filename, photo, callback) {
    var q = " UPDATE player " + 
            " SET PhotoFilename = " + mysql.escape(filename) + ',' +
            "     Photo = " + mysql.escape(photo) + ',' +
            "     LastUpdatedAt = CURRENT_TIMESTAMP() " +
            " WHERE Id = " + mysql.escape(playerId);
    adapter.query(q, callback);
}

module.exports = {
    getPlayers,
    existsPlayer,
    getPlayer,
    addPlayer,
    updatePlayer,
    removePlayer,
    addPhoto
}
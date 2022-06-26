const mysql = require('mysql');

var connString = process.env["MYSQL_CONN_STRING"]
var pool = mysql.createPool(connString);

function ping(responseCallback) {
    var con = mysql.createConnection(connString);

    con.connect(function (err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Connected!");
        }

        if (responseCallback) {
            responseCallback(err || "Connected!");
        }
    });

    con.end();
}

function getUsers(callback) {
    var q = " SELECT * FROM user";
    query(q, callback);
}

function existsUser(username, callback) {
    var q = " SELECT 1 FROM user " + 
            " WHERE Username = " + mysql.escape(username);
    query(q, callback); 
}

function getUser(username, password, callback) {
    var q = " SELECT * FROM user " + 
            " WHERE Username = " + mysql.escape(username) +
            "   AND Password = " + mysql.escape(password);
    query(q, callback);
}

function addUser(username, password, teamId, callback) {
    var q = " INSERT INTO user (Username, Password, TeamId, CreatedAt) " + 
            " VALUES (" + mysql.escape(username) + "," +
                         mysql.escape(password) + "," +
                         mysql.escape(teamId) + "," +
                         "CURRENT_TIMESTAMP())"
    query(q, callback);
}

function getUserById(id, callback) {
    var q = " SELECT * FROM user " + 
            " WHERE Id = " + mysql.escape(id)
    query(q, callback);
}

function getUsersCount(id, callback) {
    var q = " SELECT COUNT(*) FROM user"
    query(q, callback);
}

function getRoles(callback) {
    var q = " SELECT * FROM role"
    query(q, callback);
}

function getSeasons(callback) {
    var q = " SELECT * FROM season"
    query(q, callback);
}

function getSteps(callback) {
    var q = " SELECT * FROM step"
    query(q, callback);
}

function getTeams(callback) {
    var q = " SELECT * FROM team"
    query(q, callback);
}

function getTeamSteps(season, teamId, callback) {
    var q = " SELECT * FROM teamstep st " + 
            "   INNER JOIN team t ON t.Id = st.TeamId " +
            "   INNER JOIN season s ON s.Year = st.Season " + 
            " WHERE s.Year = " + mysql.escape(season) +
            "   AND t.Id = " + mysql.escape(teamId)
    query(q, callback);
}

function getTeamMissingSteps(season, teamId, callback) {
    var q = " SELECT * FROM team t " + 
            "   INNER JOIN season s ON s.Year = " + mysql.escape(season) +
            "   LEFT JOIN teamstep ts ON ts.TeamId = t.Id  AND ts.Season = s.Year" +
            " WHERE t.Id = " + mysql.escape(teamId) +
            "   AND ts.Id IS NULL "
    query(q, callback);
}

function addStep(season, teamId, stepId, callback) {
    var q = " INSERT INTO teamstep (TeamId, StepId, Season, CreatedAt) " + 
            " VALUES (" + mysql.escape(season) + "," +
                         mysql.escape(teamId) + "," +
                         mysql.escape(stepId) + "," +
                         "CURRENT_TIMESTAMP())"
    query(q, callback);
}

function deleteStep(season, teamId, stepId, callback) {
    var q = " DELETE FROM teamstep " + 
            " WHERE Season = " + mysql.escape(season) +
            "   AND TeamId = " + mysql.escape(teamId) +
            "   AND StepId = " + mysql.escape(stepId);
    query(q, callback);
}

function getStepById(stepId, callback) {
    var q = " SELECT * FROM step " +
            " WHERE st.Id = " + mysql.escape(stepId);
    query(q, callback);
}

function getStepWithSeason(stepId, season, callback) {
    var q = " SELECT * FROM step st " +
            "   INNER JOIN birthsteplimit bsl ON bsl.Season = ts.Season AND bsl.StepId = st.StepId " +
            " WHERE st.Id = " + mysql.escape(stepId) +
            "   AND st.Season = "+ mysql.escape(season);
    query(q, callback);
}

function getTeamsBySeason(season, callback) {
    var q = " SELECT s.Year, ts.TeamId, t.Name, t.ShortDescription " + 
            " FROM teamstep ts " +
            "   INNER JOIN season s ON s.Year = ts.Season" +
            "   INNER JOIN team t ON t.Id = ts.TeamId " +
            " WHERE ts.Season = " + mysql.escape(season) +
            " GROUP BY s.Year, ts.TeamId, t.Name, t.ShortDescription";
    query(q, callback);
}

function activateSeason(season, callback) {
    var q = " UPDATE season " + 
            " SET IsActive = 0 " + 
            " WHERE IsActive = 1; " +
            " UPDATE season " + 
            " SET IsActive = 1 " + 
            " WHERE Year = " + mysql.escape(season) + ";";
    query(q, callback);
}

function getPlayers (season, teamId, stepId, roles, callback) {
    var q = " SELECT * FROM player p " + 
            "   INNER JOIN step s ON s.Id = p.StepId AND s.Id = " + mysql.escape(stepId) +
            "   INNER JOIN team t ON t.Id = p.TeamId AND t.Id = " + mysql.escape(teamId) + 
            "   INNER JOIN person ps ON ps.Id = p.PersonId " +
            "   INNER JOIN role r ON r.Id = p.RoleId " +
            "   LEFT JOIN person ct ON ct.Id = p.CareTakerId " +
            " WHERE p.Season = " + mysql.escape(season) + 
            "   AND p.RoleId IN (" + roles.map((i, r) => roles.length > i + 1? mysql.escape(r) + "," : mysql.escape(r)) + ")";
    query(q, callback);
}

function existsPlayer(season, teamId, stepId, roleId, personId, callback) {
    var q = " SELECT 1 FROM player p " + 
            " WHERE p.Season = " + mysql.escape(season) + 
            "   AND p.TeamId = " + mysql.escape(teamId) +
            "   AND p.StepId = " + mysql.escape(stepId) +
            "   AND p.RoleId = " + mysql.escape(roleId) +
            "   AND p.PersonId = " + mysql.escape(personId);
    query(q, callback);
}

function getPlayer(season, teamId, stepId, playerId, callback) {
    var q = " SELECT * FROM player p " + 
            "   INNER JOIN step s ON s.Id = p.StepId AND s.Id = " + mysql.escape(stepId) +
            "   INNER JOIN team t ON t.Id = p.TeamId AND t.Id = " + mysql.escape(teamId) + 
            "   INNER JOIN person ps ON ps.Id = p.PersonId " +
            "   INNER JOIN role r ON r.Id = p.RoleId " +
            "   LEFT JOIN person ct ON ct.Id = p.CareTakerId " +
            " WHERE p.Id = " + mysql.escape(playerId) +
            "   AND p.Season = " + mysql.escape(season);
    query(q, callback);
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
    query(q, callback);
}

function updatePlayer(id, caretakerId, comments, isResident, callback) {
    var q = " UPDATE player " + 
            " SET CareTakerId = " + mysql.escape(caretakerId) +
            "   , Comments = " + mysql.escape(comments) + 
            "   , Resident = " + mysql.escape(isResident) +
            "   , LastUpdatedAt = CURRENT_TIMESTAMP() " +
            " WHERE Id = " + mysql.escape(id);
    query(q, callback);
}

function removePlayer(playerId, callback) {
    var q = " DELETE FROM player " + 
            " WHERE Id = " + mysql.escape(playerId);
    query(q, callback);
}

function query(q, callback) {
    try {
        var fn = function(err, result) {
            if (err) throw err;
            return callback(result);
        }

        pool.query(q, fn); 
    } catch(err) {
        throw err;
    }
}

module.exports = {
    ping,
    getUsers,
    existsUser,
    getUser,
    addUser,
    getUserById,
    getUsersCount,
    getRoles,
    getSeasons,
    getSteps,
    getTeams,
    getTeamSteps,
    getTeamMissingSteps,
    addStep,
    deleteStep,
    getStepById,
    getStepWithSeason,
    getTeamsBySeason,
    activateSeason,
    getPlayers,
    existsPlayer,
    getPlayer,
    addPlayer,
    updatePlayer,
    removePlayer
}

const mysql = require('mysql');
const adapter = require('../mysql');

function getUsers(callback) {
    var q = " SELECT * FROM user";
    adapter.query(q, callback);
}

function existsUser(username, callback) {
    var q = " SELECT 1 FROM user " + 
            " WHERE Username = " + mysql.escape(username);
    adapter.query(q, callback); 
}

function getUser(username, password, callback) {
    var q = " SELECT * FROM user " + 
            " WHERE Username = " + mysql.escape(username) +
            "   AND Password = " + mysql.escape(password);
    adapter.query(q, callback);
}

function addUser(username, password, teamId, callback) {
    var q = " INSERT INTO user (Username, Password, TeamId, CreatedAt) " + 
            " VALUES (" + mysql.escape(username) + "," +
                         mysql.escape(password) + "," +
                         mysql.escape(teamId) + "," +
                         "CURRENT_TIMESTAMP())";
    adapter.query(q, callback);
}

function getUserById(id, callback) {
    var q = " SELECT * FROM user " + 
            " WHERE Id = " + mysql.escape(id);
    adapter.query(q, callback);
}

function getUsersCount(callback) {
    var q = " SELECT COUNT(*) AS NrUsers FROM user";
    adapter.query(q, callback);
}

module.exports = {
    getUsers,
    existsUser,
    getUser,
    addUser,
    getUserById,
    getUsersCount
}
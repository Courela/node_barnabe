const mysql = require('mysql2');
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

function addUser(username, password, teamId, email, callback) {
    var q = " INSERT INTO user (Username, Password, TeamId, Email, CreatedAt) " + 
            " VALUES (" + mysql.escape(username) + "," +
                         mysql.escape(password) + "," +
                         mysql.escape(teamId) + "," +
                         mysql.escape(email) + "," +
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

function getUserByEmail(email, callback) {
    var q = " SELECT Username, Password, Email, TeamId, CreatedAt " +
            " FROM user " + 
            " WHERE Email = " + mysql.escape(email);
    adapter.query(q, callback);
}

function savePassword(username, password, callback) {
    var q = " UPDATE user " +
            " SET Password = " + mysql.escape(password) + 
            " WHERE Username = " + mysql.escape(username);
    adapter.query(q, callback);
}

module.exports = {
    getUsers,
    existsUser,
    getUser,
    addUser,
    getUserById,
    getUsersCount,
    getUserByEmail,
    savePassword
}
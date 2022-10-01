const mysql = require('mysql');

var connString = process.env["JAWSDB_URL"]
var pool = mysql.createPool(connString);
//pool.config.connectionLimit = 20;

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

function getRoles(callback) {
    var q = " SELECT * FROM role";
    query(q, callback);
}

function getSeasons(callback) {
    var q = " SELECT * FROM season";
    query(q, callback);
}

function getSteps(callback) {
    var q = " SELECT * FROM step";
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

function updateSeason(season, isActive, signUpDueDate, startDate, signUpExtraDueDate, callback) {
    var q = " UPDATE season " + 
            " SET IsActive = " + mysql.escape(isActive) + 
            "   , SignUpDueDate = " + mysql.escape(signUpDueDate) +
            "   , StartDate = " + mysql.escape(startDate) +
            "   , SignUpExtraDueDate = " + mysql.escape(signUpExtraDueDate) +
            " WHERE Year = " + mysql.escape(season) + ";";
    query(q, callback);
}

function query(q, callback) {
    try {
        var fn = function(err, result) {
            if (err) {
                console.error(err);
            }
            return callback(result);
        }

        pool.query(q, fn);
    } catch(err) {
        console.error(err);
    }
}

module.exports = {
    query,
    ping,
    getRoles,
    getSeasons,
    getSteps,
    activateSeason,
    updateSeason
}

const mysql = require('mysql2');

const config = { 
    host: process.env["DB_HOST"],
    port: process.env["DB_PORT"],
    database: process.env["DB_DATABASE"],
    user: process.env["DB_USER"],
    password: process.env["DB_PASSWORD"]
};
var pool = mysql.createPool(config);
//pool.config.connectionLimit = 20;

function ping(responseCallback) {
    var con = mysql.createConnection(config);

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
    var q = " SELECT Id, Description FROM role";
    query(q, callback);
}

function getSeasons(callback) {
    var q = " SELECT Year, IsActive, SignUpDueDate, StartDate, SignUpExtraDueDate FROM season ";
    query(q, callback);
}

function getSteps(callback) {
    var q = " SELECT Id, Description, Gender, IsCaretakerRequired FROM step";
    query(q, callback);
}

function getPhases(callback) {
    var q = " SELECT Id, Name FROM `phase`";
    query(q, callback);
}

function addSeason(season, isActive, signUpDueDate, startDate, callback) {
    var q = " INSERT season (Year, IsActive, SignUpDueDate, StartDate) " + 
            " VALUES (" + mysql.escape(season) +
            "        ," + mysql.escape(isActive) +
            "        ," + mysql.escape(signUpDueDate) + 
            "        ," + mysql.escape(startDate) + ") "; 
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
                result = err.code;
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
    getPhases,
    addSeason,
    activateSeason,
    updateSeason
}

const mysqlStorage = require("../db/mysql")

function getRoles() {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("getRoles response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            mysqlStorage.getRoles(fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function getSeasons() {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("getSeasons response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            mysqlStorage.getSeasons(fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function getSteps() {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("getSteps response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            mysqlStorage.getSteps(fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

module.exports = {
    getRoles,
    getSeasons,
    getSteps
}

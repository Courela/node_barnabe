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

function getPhases() {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("getPhases response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            mysqlStorage.getPhases(fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function getDocuments() {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("getPhases response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            mysqlStorage.getDocuments(fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function loadDocument(name, type, link) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            mysqlStorage.loadDocument(name, type, link, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

module.exports = {
    getRoles,
    getSeasons,
    getSteps,
    getPhases,
    getDocuments,
    loadDocument
}

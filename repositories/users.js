const mysqlStorage = require("../db/mysql")

function getUsers() {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("getUsers response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            mysqlStorage.getUsers(fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function existsUser(username) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("existsUser response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            mysqlStorage.existsUser(username, fn);
        }
        catch(err) {
            reject(err);
        }
    });  
}

function getUser(username, password) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("getUser response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            mysqlStorage.getUser(username, password, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function addUser(username, password, teamId) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("addUser response:", r);
                resolve({ recordset: [true], rowsAffected: [1] });
            }
            mysqlStorage.addUser(username, password, teamId, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function getUserById(id) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("getUserById response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            mysqlStorage.getUserById(id, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function getUsersCount() {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("getUsersCount response:", r);
                resolve({ recordset: r, rowsAffected: 1 });
            }
            mysqlStorage.getUsersCount(fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

module.exports = {
    getUsers,
    addUser,
    existsUser,
    getUserById,
    getUser,
    getUsersCount
}
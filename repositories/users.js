const mysqlStorage = require("../db/mysql/users")

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

function addUser(username, password, teamId, email) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("addUser response:", r);
                resolve({ recordset: [true], rowsAffected: [1] });
            }
            mysqlStorage.addUser(username, password, teamId, email, fn);
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

function getUserByEmail(email) {
    console.log("Searching user for email", email);
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("getUserByEmail response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            mysqlStorage.getUserByEmail(email, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function savePassword(username, password) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("savePassword response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            mysqlStorage.savePassword(username, password, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function saveDetails(username, password, email) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                // console.log("saveDetails response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            mysqlStorage.saveDetails(username, password, email, fn);
        }
        catch(err) {
            // console.log("Rejected!");
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
    getUsersCount,
    getUserByEmail,
    savePassword,
    saveDetails
}
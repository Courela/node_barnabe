const storage = require('../db/storage');

function getUserById(id) {
    const query = function (users) {
        return users.get('User')
            .cloneDeep()
            .find({ Id: id })
            .value();
    };
    return new Promise((resolve, reject) => {
        try {
            const user = storage.usersStatementQuery(query);
            let result = [];
            if (user) { result.push(user); }
            resolve({ recordset: result, rowsAffected: [result.length] });
        }
        catch(err) {
            reject(err);
        }
    });
}

function getUser(username, password) {
    const query = function (users) {
        console.log("Logging in with: "+username+" "+password);
        return users.get('User')
            .cloneDeep()
            .find({ Username: username, Password: password })
            .value();
    };
    return new Promise((resolve, reject) => {
        try {
            const user = storage.usersStatementQuery(query);
            console.log("User found:", user);
            let result = [];
            if (user) { result.push(user); }
            resolve({ recordset: result, rowsAffected: [result.length] });
        }
        catch(err) {
            reject(err);
        }
    });
}

module.exports = {
    getUserById,
    getUser
}
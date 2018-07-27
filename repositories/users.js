const storage = require('../db/storage');

function existsUser(username) {
    const query = function (users) {
        return users.get('User')
            .cloneDeep()
            .find({ Username: username })
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

function addUser(username, password, teamId) {
    const query = function (users) {
        const last = users.get('User').cloneDeep().last().value();
        let id = last && last.Id ? last.Id + 1 : 1;
        if (id < 11) { id = 11; }

        return users.get('User')
            .push({
                Id: id, 
                Username: username, 
                Password: password, 
                TeamId: teamId,
                CreatedAt: new Date()
            })
            .write();
    };
    return new Promise((resolve, reject) => {
        try {
            const user = storage.usersStatementQuery(query);
            resolve({ recordset: [true], rowsAffected: [1] });
        }
        catch(err) {
            reject(err);
        }
    });
}

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
    addUser,
    existsUser,
    getUserById,
    getUser
}
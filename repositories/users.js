const db = require('../db/adapter');
const storage = require('../db/storage');

function getUserById(id) {
    const query = function (users) {
        return users.get('User')
            .find({ Id: id })
            .value();
    };
    return new Promise((resolve, reject) => {
        try {
            const user = storage.usersStatementQuery(query);
            let result = [];
            if (user) { result.push(user); }
            resolve({ recordset: result });
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
            .find({ Username: username, Password: password })
            .value();
    };
    return new Promise((resolve, reject) => {
        try {
            const user = storage.usersStatementQuery(query);
            console.log("User found:");
            console.log(user);
            let result = [];
            if (user) { result.push(user); }
            resolve({ recordset: result });
        }
        catch(err) {
            reject(err);
        }
    });
}

// function getUserById(id) {
//     return db.getSingle('auth.[User]', id);
// }

// function getUser(username, password) {
//     const query = ' SELECT * FROM auth.[User] ' +
//         ' WHERE Username = @user AND Password = @pass';
//     const parameters = [{
//         name: 'user',
//         type: db.sql_string,
//         value: username
//     },{
//         name: 'pass',
//         type: db.sql_string,
//         value: password
//     }];
//     return db.statementQuery(query, parameters);
// }

module.exports = {
    getUserById,
    getUser
}
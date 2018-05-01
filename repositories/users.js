const db = require('../db/adapter');

function getUserById(id) {
    return db.getSingle('auth.[User]', id);
}

function getUser(username, password) {
    const query = ' SELECT * FROM auth.[User] ' +
        ' WHERE Username = @user AND Password = @pass';
    const parameters = [{
        name: 'user',
        type: db.sql_string,
        value: username
    },{
        name: 'pass',
        type: db.sql_string,
        value: password
    }];
    return db.selectQuery(query, parameters);
}

module.exports = {
    getUserById,
    getUser
}
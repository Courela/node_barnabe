const db = require('./operator');

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

function setToken(username, token) {
    const query = ' UPDATE auth.[User] ' +
        ' SET Token = @token, TokenAt = GETDATE() ' + 
        ' WHERE Username = @user ';
    const parameters = [{
        name: 'user',
        type: db.sql_string,
        value: username
    },{
        name: 'token',
        type: db.sql_string,
        value: token
    }];
    return db.selectQuery(query, parameters);
}

module.exports = {
    getUser,
    setToken
}

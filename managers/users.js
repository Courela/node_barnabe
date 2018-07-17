const usersRepo = require('../repositories/users');

function existsUser(username) {
    return usersRepo.existsUser(username)
        .then(result => {
            if (result.recordset && result.recordset.length > 0) {
                return true;
            } else {
                return null;
            }
        })
        .catch((err) => {
            console.log(err);
            throw 'Unexpected error!';
        });
}

function addUser(username, password, teamId) {
    return usersRepo.addUser(username, password, teamId)
        .then(result => {
            if (result.recordset && result.recordset.length > 0) {
                return result.recordset[0];
            } else {
                return null;
            }
        })
        .catch((err) => {
            console.log(err);
            throw 'Unexpected error!';
        });
}

function getUserById(id) {
    return usersRepo.getUserById(id)
        .then(result => {
            if (result.recordset && result.recordset.length > 0) {
                return result.recordset[0];
            } else {
                return null;
            }
        })
        .catch((err) => {
            console.log(err);
            throw 'Unexpected error!';
        });
}

function getUser(username, password) {
    return usersRepo.getUser(username, password)
        .then(result => {
            if (result.recordset && result.recordset.length > 0) {
                return result.recordset[0];
            } else {
                return null;
            }
        })
        .catch((err) => {
            console.log(err);
            throw 'Unexpected error!';
        });
}

module.exports = {
    addUser,
    existsUser,
    getUserById,
    getUser
}
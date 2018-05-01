const usersRepo = require('../repositories/users');

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
    getUserById,
    getUser
}
const teamsMgr = require('./teams');
const usersRepo = require('../repositories/users');

function getUsers() {
    return usersRepo.getUsers()
        .then(async r => {
            var result = [];
            if (r.recordset) {
                for(var u of r.recordset) {
                    var team = await teamsMgr.getTeamById(u.TeamId);
                    result.push(Object.assign(u, { Team: team }));
                }
            }
            //console.log("getUsers manager response: ", result);
            return result;
        })
        .catch((err) => {
            console.log(err);
            throw 'Unexpected error!';
        });
}

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

function addUser(username, password, teamId, email) {
    return usersRepo.addUser(username, password, teamId, email)
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

function getUsersCount() {
    return usersRepo.getUsersCount()
        .then(result => result.recordset[0] ? result.recordset[0].NrUsers : 0)
        .catch((err) => {
            console.log(err);
            throw 'Unexpected error!';
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
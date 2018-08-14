const storage = require('../db/storage');

function getRoles() {
    const query = function (db) {
        const roles = db.get('Role')
            .cloneDeep()
            .value();
        return { recordset: roles, rowsAffected: [roles.length] };
    };
    return new Promise((resolve, reject) => {
        try {
            const result = storage.statementQuery(query);
            resolve(result);
        }
        catch(err) {
            reject(err);
        }
    });
}

function getSeasons() {
    const query = function (db) {
        const seasons = db.get('Season')
            .cloneDeep()
            .orderBy('Year', 'desc')
            .value();
        return { recordset: seasons, rowsAffected: [seasons.length] };
    };
    return new Promise((resolve, reject) => {
        try {
            const result = storage.statementQuery(query);
            resolve(result);
        }
        catch(err) {
            reject(err);
        }
    });
}

function getSteps() {
    const query = function (db) {
        const roles = db.get('Step')
            .cloneDeep()
            .value();
        return { recordset: roles, rowsAffected: [roles.length] };
    };
    return new Promise((resolve, reject) => {
        try {
            const result = storage.statementQuery(query);
            resolve(result);
        }
        catch(err) {
            reject(err);
        }
    });
}

module.exports = {
    getRoles,
    getSeasons,
    getSteps
}

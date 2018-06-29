const storage = require('../db/storage');

function getRoles() {
    const query = function (db) {
        const roles = db.get('Role')
            .cloneDeep()
            .value();
        return { recordset: roles };
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
    getRoles
}

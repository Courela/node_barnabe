const storage = require('../db/storage');

function activateSeason(season) {
    const query = function (db) {
        db.get('Season')
            .find({ IsActive: true })
            .assign({ IsActive: false })
            .write();

        const result = db.get('Season')
            .find({ Year: season })
            .assign({ IsActive: true })
            .write();

        return result;
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
    activateSeason
}

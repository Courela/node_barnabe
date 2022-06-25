const storage = require('../db/storage');

function activateSeason(season) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                console.log("activateSeason response:", r);
                resolve(r);
            }
            mysqlStorage.activateSeason(season, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

module.exports = {
    activateSeason
}

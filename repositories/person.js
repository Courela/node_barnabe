const storage = require('../db/storage');
const mysqlStorage = require('../db/mysql/person');

function getPersonById(id) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                resolve({ recordset: r[0], rowsAffected: [r.length] });
            }
            mysqlStorage.getPersonById(id, fn);
        }
        catch(err) {
            reject(err);
        }
    });

    //return storage.getSingle('Person', id);
}

function getPersonByIdCardNr(idCardNr) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                resolve({ recordset: r[0], rowsAffected: [r.length] });
            }
            mysqlStorage.getPersonByIdCardNr(idCardNr, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function addPerson(name, gender, birthdate, idCardNr, voterNr, phone, email, isLocalBorn, isLocalTown) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("addPerson response:", r);
                resolve({ recordset: r, rowsAffected: [r.affectedRows] });
            }
            mysqlStorage.addPerson(name, gender, birthdate, idCardNr, voterNr, phone, email, isLocalBorn, isLocalTown, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

function updatePerson(id, name, gender, birthdate, idCardNr, voterNr, phone, email, isLocalBorn, isLocalTown) {
    //console.log("updatePerson repository birthdate:", birthdate);
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("updatePerson response:", r);
                resolve({ recordset: r, rowsAffected: r.affectedRows });
            }
            mysqlStorage.updatePerson(id, name, gender, birthdate, idCardNr, voterNr, phone, email, isLocalBorn, isLocalTown, fn);
        }
        catch(err) {
            reject(err);
        }
    });
}

module.exports = {
    getPersonById,
    getPersonByIdCardNr,
    addPerson,
    updatePerson
}

const storage = require('../db/storage');
const mysqlStorage = require('../db/mysql/person');

function getPersonById(id) {
    return storage.getSingle('Person', id);
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
    // //console.log('Search DocId: ' + idCardNr);
    // const query = function (db) {
    //     const persons = db.get('Person')
    //         .cloneDeep()
    //         .filter({ IdCardNr: idCardNr })
    //         .value();
    //     //console.log('Get storage person:',person);
    //     if (persons) {
    //         return { recordset: persons, rowsAffected: [ persons.length ] };
    //     }
    //     else {
    //         return { recordset: [], rowsAffected: [ 0 ] };
    //     }
    // };
    // return new Promise((resolve, reject) => {
    //     try {
    //         const result = storage.statementQuery(query);
    //         resolve(result);
    //     }
    //     catch(err) {
    //         reject(err);
    //     }
    // });
}

function addPerson(name, gender, birthdate, docId, voterNr, phone, email, isLocalBorn, isLocalTown) {
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("addPerson response:", r);
                resolve({ recordset: r, rowsAffected: [r.length] });
            }
            mysqlStorage.addPerson(name, gender, birthdate, docId, voterNr, phone, email, isLocalBorn, isLocalTown, fn);
        }
        catch(err) {
            reject(err);
        }
    });
    // //console.log('Person to insert: ' + name + gender + birthdate + docId + voterNr + phone + email);
    // console.log('New Person: ', docId);
    // const query = function (db) {
    //     const last = db.get('Person')
    //         .cloneDeep()
    //         .last()
    //         .value();
    //     const id = last ? last.Id + 1 : 1;
    //     const person = { 
    //         Id: id, 
    //         Name: name, 
    //         Gender: gender, 
    //         Birthdate: birthdate, 
    //         IdCardNr: docId,
    //         IdCardExpireDate: null,
    //         VoterNr: voterNr, 
    //         Phone: phone, 
    //         Email: email,
    //         LocalBorn: isLocalBorn ? isLocalBorn : false,
    //         LocalTown: isLocalTown ? isLocalTown : false,
    //         CreatedAt: new Date()
    //     };
    //     db.get('Person')
    //         .push(person)
    //         .write();
    //     //console.log('Add storage person:'); console.log(person);
    //     return { recordset: [ person ], rowsAffected: [1] };
    // };
    // return new Promise((resolve, reject) => {
    //     try {
    //         const result = storage.statementQuery(query);
    //         resolve(result);
    //     }
    //     catch(err) {
    //         reject(err);
    //     }
    // });
}

function updatePerson(id, name, gender, birthdate, docId, voterNr, phone, email, isLocalBorn, isLocalTown) {
    console.log("updatePerson repository birthdate:", birthdate);
    return new Promise((resolve, reject) => {
        try {
            var fn = function(r) {
                //console.log("updatePerson response:", r);
                resolve({ recordset: r, rowsAffected: r.affectedRows });
            }
            mysqlStorage.updatePerson(id, name, gender, birthdate, docId, voterNr, phone, email, isLocalBorn, isLocalTown, fn);
        }
        catch(err) {
            reject(err);
        }
    });
    // console.log('Updating Person: ', docId);
    // const query = function (db) {
    //     const person = db.get('Person')
    //         .find({ Id: id })
    //         .assign({ 
    //             Name: name, 
    //             Gender: gender,
    //             Birthdate: birthdate, 
    //             VoterNr: voterNr, 
    //             Phone: phone, 
    //             Email: email,
    //             LocalBorn: isLocalBorn ? isLocalBorn : false,
    //             LocalTown: isLocalTown ? isLocalTown : false,
    //             LastUpdatedAt: new Date()
    //         })
    //         .write();
    //     //console.log('Storage person:'); console.log(person);
    //     return { rowsAffected: [1] };
    // };
    // return new Promise((resolve, reject) => {
    //     try {
    //         const result = storage.statementQuery(query);
    //         resolve(result);
    //     }
    //     catch(err) {
    //         reject(err);
    //     }
    // });
}

module.exports = {
    getPersonById,
    getPersonByIdCardNr,
    addPerson,
    updatePerson
}

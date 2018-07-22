const storage = require('../db/storage');

function getPersonById(id) {
    return storage.getSingle('Person', id);
}

function getPersonByIdCardNr(idCardNr) {
    //console.log('Search DocId: ' + idCardNr);
    const query = function (db) {
        const person = db.get('Person')
            .cloneDeep()
            .find({ IdCardNr: idCardNr })
            .value();
        //console.log('Get storage person:',person);
        if (person) {
            return { recordset: [ person ], rowsAffected: [ 1 ] };
        }
        else {
            return { recordset: [], rowsAffected: [ 0 ] };
        }
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

function addPerson(name, gender, birthdate, docId, voterNr, phone, email) {
    //console.log('Person to insert: ' + name + gender + birthdate + docId + voterNr + phone + email);
    console.log('New Person: ', docId);
    const query = function (db) {
        const last = db.get('Person')
            .cloneDeep()
            .last()
            .value();
        const id = last ? last.Id + 1 : 1;
        const person = { 
            Id: id, 
            Name: name, 
            Gender: gender, 
            Birthdate: birthdate, 
            IdCardNr: docId,
            IdCardExpireDate: null,
            VoterNr: voterNr, 
            Phone: phone, 
            Email: email };
        db.get('Person')
            .push(person)
            .write();
        //console.log('Add storage person:'); console.log(person);
        return { recordset: [ person ], rowsAffected: [1] };
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

function updatePerson(id, name, gender, birthdate, docId, voterNr, phone, email) {
    //console.log('Person to update: ', id, name, gender, birthdate, docId, voterNr, phone, email);
    console.log('Updating Person: ', docId);
    const query = function (db) {
        const person = db.get('Person')
            .find({ Id: id })
            .assign({ Name: name, Gender: gender, Birthdate: birthdate, VoterNr: voterNr, Phone: phone, Email: email })
            .write();
        //console.log('Storage person:'); console.log(person);
        return { rowsAffected: [1] };
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
    getPersonById,
    getPersonByIdCardNr,
    addPerson,
    updatePerson
}

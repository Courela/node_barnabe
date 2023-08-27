const mysql = require('mysql2');
const adapter = require('../mysql');

function getPersonById(id, callback) {
    var q = " SELECT * FROM person " +
            " WHERE Id = " + mysql.escape(id);
    adapter.query(q, callback);     
}

function getPersonByIdCardNr(idCardNr, callback) {
    var q = " SELECT * FROM person " + 
            " WHERE IdCardNr = " + mysql.escape(idCardNr);
    adapter.query(q, callback);
}

function addPerson(name, gender, birthdate, idCardNr, voterNr, phone, email, isLocalBorn, isLocalTown, callback) {
    var q = " INSERT INTO person (Name, Gender, Birthdate, IdCardNr, VoterNr, Phone, Email, LocalBorn, LocalTown, CreatedAt, LastUpdatedAt) " + 
            " VALUES (" + mysql.escape(name) + "," +
                          mysql.escape(gender) + "," +
                          mysql.escape(birthdate) + "," +
                          mysql.escape(idCardNr) + "," +
                          mysql.escape(voterNr) + "," +
                          mysql.escape(phone) + "," +
                          mysql.escape(email) + "," +
                          mysql.escape(isLocalBorn) + "," +
                          mysql.escape(isLocalTown) + "," +
                          "CURRENT_TIMESTAMP()," +
                          "CURRENT_TIMESTAMP())";
    adapter.query(q, callback);
}

function updatePerson(id, name, gender, birthdate, idCardNr, voterNr, phone, email, isLocalBorn, isLocalTown, callback) {
    var q = " UPDATE person " +
            " SET Name = " + mysql.escape(name) + "," +
            "     Gender = " + (gender ? mysql.escape(gender) : 'Gender') + "," +
            "     Birthdate = "+ (birthdate ? mysql.escape(birthdate) : 'Birthdate') + "," +
            "     IdCardNr = " + mysql.escape(idCardNr) + "," +
            "     VoterNr = " + (voterNr ? mysql.escape(voterNr) : 'VoterNr') + "," +
            "     Phone = " + (phone ? mysql.escape(phone) : 'Phone') + "," +
            "     Email = " + (email? mysql.escape(email) : 'Email') + "," +
            "     LocalBorn = " + (isLocalBorn ? mysql.escape(isLocalBorn) : 'LocalBorn') + "," +
            "     LocalTown = " + (isLocalTown ? mysql.escape(isLocalTown) : 'LocalTown') + "," +
            "     LastUpdatedAt = CURRENT_TIMESTAMP() " +
            " WHERE Id = " + mysql.escape(id);
    //console.log("updatePerson query: ", q);
    adapter.query(q, callback);
}

module.exports = {
    getPersonById,
    getPersonByIdCardNr,
    addPerson,
    updatePerson
}
const personRepo = require('../repositories/person');

function getPersonByIdCardNr(docId){
    return personRepo.getPersonByIdCardNr(docId)
        .then((results) => {
            console.log(results);
            return results.rowsAffected[0] > 0 ? results.recordset[0] : null;
        })
        .catch((err) => {
            console.error(err);
            return null;
        });
}

function addPerson (name, gender, birthdate, docId, voterNr, phone, email) {
    return personRepo.addPerson(name, gender, birthdate, docId, voterNr, email, phone)
        .then((results) => {
            console.log(results);
            return results.recordset && results.recordset.length > 0 ? 
                results.recordset[0] : null;
        })
        .catch((err) => {
            console.error(err);
            const res = err.name == 'RequestError' ? 0 : -1;
            return res;
    });
}

module.exports = {
    getPersonByIdCardNr,
    addPerson
}

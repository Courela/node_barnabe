const personRepo = require('../repositories/person');
const validations = require('../utils/validations');
const { stringLimit } = validations;

function getPersonById(id) {
    return personRepo.getPersonById(id);
}

function getPersonByIdCardNr(docId){
    return personRepo.getPersonByIdCardNr(docId)
        .then((results) => {
            //console.log(results);
            return results.rowsAffected[0] > 0 ? results.recordset : null;
        })
        .catch((err) => {
            console.error(err);
            return null;
        });
}

function addPerson (name, gender, birthdate, docId, voterNr, phone, email, isLocalBorn, isLocalTown) {
    return personRepo.addPerson(
            stringLimit(name, validations.NAME_MAX_LENGTH), 
            gender,
            birthdate, 
            stringLimit(docId, validations.DOC_ID_MAX_LENGTH), 
            stringLimit(voterNr, validations.VOTER_NR_MAX_LENGTH),
            stringLimit(phone, validations.PHONE_MAX_LENGTH),
            stringLimit(email, validations.EMAIL_MAX_LENGTH),
            isLocalBorn,
            isLocalTown
        )
        .then((results) => {
            //console.log(results);
            return results.recordset && results.recordset.length > 0 ? 
                results.recordset[0] : null;
        })
        .catch((err) => {
            console.error(err);
            const res = err.name == 'RequestError' ? 0 : -1;
            return res;
    });
}

function updatePerson(person) {
    const { id, name, gender, birth, docId, voterNr, phoneNr, email, isLocalBorn, isLocalTown } = person;
    return personRepo.updatePerson(id,
            stringLimit(name, validations.NAME_MAX_LENGTH), 
            gender,
            birth, 
            stringLimit(docId, validations.DOC_ID_MAX_LENGTH), 
            stringLimit(voterNr, validations.VOTER_NR_MAX_LENGTH),
            stringLimit(phoneNr, validations.PHONE_MAX_LENGTH),
            stringLimit(email, validations.EMAIL_MAX_LENGTH),
            isLocalBorn,
            isLocalTown
        )
        .then((results) => {
            //console.log(results);
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
    getPersonById,
    getPersonByIdCardNr,
    addPerson,
    updatePerson
}

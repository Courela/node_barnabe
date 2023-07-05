const personRepo = require('../repositories/person');
const validations = require('../utils/validations');
const { stringLimit } = validations;

function getPersonById(id) {
    return personRepo.getPersonById(id)
        .then((results) => {
            if(results.rowsAffected[0] > 0) {
                return results.recordset;
            } else {
                return null;
            }
        })
        .catch((err) => {
            console.error(err);
            return null;
        });
}

function getPersonByIdCardNr(idCardNr){
    return personRepo.getPersonByIdCardNr(idCardNr)
        .then((results) => {
            if(results.rowsAffected[0] > 0) {
                //TODO Set datetime to UTC, currently GMT+1 
                var d = new Date(results.recordset.Birthdate);
                d.setHours(d.getHours()+1);
                Object.assign(results.recordset, { Birthdate: d });
                return results.recordset;
            } else {
                return null;
            }
        })
        .catch((err) => {
            console.error(err);
            return null;
        });
}

function addPerson (name, gender, birthdate, idCardNr, voterNr, phone, email, isLocalBorn, isLocalTown) {
    return personRepo.addPerson(
            stringLimit(name, validations.NAME_MAX_LENGTH), 
            gender,
            birthdate ? new Date(birthdate) : birthdate, 
            stringLimit(idCardNr, validations.DOC_ID_MAX_LENGTH), 
            stringLimit(voterNr, validations.VOTER_NR_MAX_LENGTH),
            stringLimit(phone, validations.PHONE_MAX_LENGTH),
            stringLimit(email, validations.EMAIL_MAX_LENGTH),
            isLocalBorn ? isLocalBorn : 0,
            isLocalTown ? isLocalTown : 0
        )
        .then((results) => {
            return results.recordset && results.recordset.insertId ? 
                getPersonById(results.recordset.insertId) : null;
        })
        .catch((err) => {
            console.error(err);
            const res = err.name == 'RequestError' ? 0 : -1;
            return res;
    });
}

function updatePerson(person) {
    const { Id, Name, Gender, Birthdate, IdCardNr, VoterNr, Phone, Email, LocalBorn, LocalTown } = person;
    return personRepo.updatePerson(Id,
            stringLimit(Name, validations.NAME_MAX_LENGTH), 
            Gender,
            Birthdate, 
            stringLimit(IdCardNr, validations.DOC_ID_MAX_LENGTH), 
            stringLimit(VoterNr, validations.VOTER_NR_MAX_LENGTH),
            stringLimit(Phone, validations.PHONE_MAX_LENGTH),
            stringLimit(Email, validations.EMAIL_MAX_LENGTH),
            LocalBorn ? LocalBorn : 0,
            LocalTown ? LocalTown : 0
        )
        .then((results) => {
            return results.recordset ? 
                results.affectedRows : 0;
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

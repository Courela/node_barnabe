const playersRepo = require('../repositories/players');
const personMgr = require('../managers/person');
const teamsMgr = require('../managers/teams');

function getPlayers(season, teamId, stepId, roles) {
    return playersRepo.getPlayers(season, teamId, stepId, roles)
        .then((results) => {
            //console.log(results);
            return results.recordset;
        })
        .catch((err) => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

function getPlayer(season, teamId, stepId, playerId) {
    return playersRepo.getPlayer(season, teamId, stepId, playerId)
        .then((results) => {
            //console.log(results);
            if (results.rowsAffected > 0) {
                var fs = require('fs');
                var url = './data/storage/' + [season, teamId, stepId, results.recordset[0].Id].join('_');
                let photo = [];
                if (fs.existsSync(url)) { photo = fs.readFileSync(url); }
                //console.log('Photo: ' + photo.length);
                return { player: results.recordset[0], photo: photo.toString() };
            }
            else {
                return null;
            }
        })
        .catch((err) => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

async function addPlayer(teamId, stepId, season, person, roleId, caretaker, comments) {
    let personEntity = await personMgr.getPersonByIdCardNr(person.docId);
    //console.log('Person: ', personEntity);
    if (personEntity) {
        if (await playersRepo.existsPlayer(teamId, stepId, season, personEntity.Id)) {
            console.warn('Player already exists!');
            return -409;
        }
        await personMgr.updatePerson(person);
    } else {
        personEntity = await personMgr.addPerson(person.name, person.gender, person.birth, person.docId, person.voterNr, person.phoneNr, person.email);
    }

    let caretakerEntity = null;
    if (caretaker && caretaker.docId) {
        caretakerEntity = await personMgr.getPersonByIdCardNr(caretaker.docId);
        //console.log('Caretaker: ', caretakerEntity);
        if (caretakerEntity !== null) {
            personMgr.updatePerson(caretaker);
        } else {
            caretakerEntity = await personMgr.addPerson(caretaker.name, null, null, caretaker.docId, caretaker.voterNr, caretaker.phoneNr, caretaker.email);
        }
    }

    const resident = person.voterNr !== null ? 1 : 0;
    //const roleId = 1;
    return playersRepo.addPlayer(teamId, stepId, season, resident, personEntity.Id, roleId, caretakerEntity ? caretakerEntity.id : null, comments)
        .then(result => {
            //console.log('Add Player result:');
            console.log(result);
            if (result.recordset && result.recordset.length > 0) {
                if (person.photo) {
                    savePhoto([season, teamId, stepId, result.recordset[0].Id].join('_'), person.photo);
                }
                return result.recordset[0].Id;
            }
            else { return result.rowsAffected[0]; }
        })
        .catch((err) => {
            console.error(err);
            const res = err.name == 'RequestError' ? -409 : -500;
            return res;
        });
}

async function updatePlayer(teamId, stepId, season, playerId, person, roleId, caretaker, comments) {
    try {
        //console.log('Person: ', person);
        //console.log('Caretaker: ', caretaker);
        
        let newCaretaker = null;
        await personMgr.updatePerson(person);
        const caretakerPerson = await personMgr.getPersonByIdCardNr(caretaker.docId);
        if (caretakerPerson) {
            const merge = {
                id: caretaker.id,
                name: caretaker.name,
                voterNr: caretaker.voterNr,
                phoneNr: caretaker.phoneNr,
                email: caretaker.email,

                gender: caretakerPerson.Gender,
                birth: caretakerPerson.Birthdate,
                docId: caretakerPerson.IdCardNr
            };
            await personMgr.updatePerson(merge);
        }
        else {
            newCaretaker = await personMgr.addPerson(caretaker.name, null, null, caretaker.docId, caretaker.voterNr, caretaker.phoneNr, caretaker.email);
        }

        if (comments) {
            const caretakerId = newCaretaker ? newCaretaker.Id : caretaker.id;
            await playersRepo.updatePlayer(playerId, caretakerId, comments);
        }
    }
    catch (err) {
        console.log(err);
        throw 'Error';
    }
}

function savePhoto(filename, photoSrc) {
    console.log('Saving file ' + filename)
    var fs = require('fs');
    fs.writeFile("./data/storage/" + filename, photoSrc, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}

function removePlayer(teamId, stepId, season, playerId) {
    return playersRepo.removePlayer(teamId, stepId, season, playerId)
        .then(result => {

        })
        .catch(err => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

module.exports = {
    addPlayer,
    getPlayer,
    updatePlayer,
    getPlayers,
    removePlayer
}

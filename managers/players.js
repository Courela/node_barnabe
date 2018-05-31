const playersRepo = require('../repositories/players');
const personMgr = require('../managers/person');
const teamsMgr = require('../managers/teams');

function getPlayers(season, teamId, stepId) {
    return playersRepo.getPlayers(season, teamId, stepId)
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
            var fs = require('fs');
            let photo = fs.readFileSync('./data/storage/' + [season, teamId, stepId, results.recordset[0].Id].join('_'));
            console.log('Photo: ' + photo.length);
            return { data: results.recordset, photo: photo.toString() };
        })
        .catch((err) => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

async function addPlayer(teamId, stepId, season, person, caretaker) {
    let caretakerEntity = null;
    if (caretaker && caretaker.docId) {
        caretakerEntity = await personMgr.getPersonByIdCardNr(caretaker.docId);
        console.log('Caretaker: ' + JSON.stringify(caretakerEntity));
        if (caretakerEntity !== null) {
            personMgr.updatePerson(caretaker);
        } else {
            caretakerEntity = await personMgr.addPerson(caretaker.name, null, null, caretaker.docId, caretaker.voterNr, caretaker.email, caretaker.phoneNr);    
        }
    }
        
    let personEntity = await personMgr.getPersonByIdCardNr(person.docId);
    console.log('Person: ' + JSON.stringify(personEntity));
    if (personEntity !== null) {
        await personMgr.updatePerson(person);
    } else {
        personEntity = await personMgr.addPerson(person.name, person.gender, person.birth, person.docId, person.voterNr, person.email, person.phoneNr);
    }

    const resident = person.voterNr !== null ? 1 : 0;
    const roleId = 1;
    return playersRepo.addPlayer(teamId, stepId, season, resident, personEntity.Id, roleId, caretakerEntity ? caretakerEntity.id : null)
        .then(result => {
            console.log('Add Player result:');
            console.log(result);
            // if (result.recordset && result.recordset.length > 0) {
            //     savePhoto([season, teamId, stepId, result.recordset[0].Id].join('_'), person.photo);
            //     return result.recordset[0].Id;
            // }
            // else return result.rowsAffected[0];
            return 0;
        })
        .catch((err) => {
            console.error(err);
            const res = err.name == 'RequestError' ? 0 : -1;
            return res;
        });
}

function savePhoto(filename, photoSrc) {
    var fs = require('fs');
    fs.writeFile("./data/storage/" + filename, photoSrc, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }); 
}

module.exports = {
    addPlayer,
    getPlayer,
    getPlayers
}

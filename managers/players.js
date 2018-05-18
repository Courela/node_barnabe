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

async function addPlayer(teamId, stepId, season, name, gender, birth, docId, voterNr, phone, email) {
    let person = await personMgr.getPersonByIdCardNr(docId);
    //const step = await teamsMgr.getStep(stepId);
    //console.log('Person: ' + JSON.stringify(person));
    if (!person) {
        person = await personMgr.addPerson(name, gender, birth, docId, voterNr, email, phone);
    }

    const resident = voterNr !== null ? 1 : 0;
    const roleId = 1;
    return playersRepo.addPlayer(teamId, stepId, season, resident, person.Id, roleId, null)
        .then(result => {
            //console.log('Add Player result:');
            //console.log(result);
            if (result.recordset && result.recordset.length > 0) {
                return result.recordset[0].Id;
            }
            else return result.rowsAffected[0];
        })
        .catch((err) => {
            console.error(err);
            const res = err.name == 'RequestError' ? 0 : -1;
            return res;
        });
}

module.exports = {
    addPlayer,
    getPlayers
}

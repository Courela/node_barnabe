const playersRepo = require('../repositories/players');
const teamsMgr = require('../managers/teams');
const personMgr = require('../managers/person');
//const teamsMgr = require('../managers/teams');
const validations = require('../utils/validations');
const { stringLimit } = validations;
const storage = require('../utils/storage');

async function getPlayers(season, teamId, stepId, roles) {
    const teamSteps = await teamsMgr.getTeamSteps(season, teamId, false);
    const step = teamSteps.find(s => s.Id === stepId);
    if (step) {
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
    else {
        return Promise.resolve(null);
    }
}

async function getPlayer(season, teamId, stepId, playerId) {
    try {
        const results = await playersRepo.getPlayer(season, teamId, stepId, playerId);
        //console.log(results);
        if (results.rowsAffected > 0) {
            const player = results.recordset[0];
            let photo = [];
            if (player.PhotoFilename) {
                photo = storage.getPhoto(season, teamId, stepId, player.PhotoFilename);
            }
            // if (player.DocFilename) {
            //     var docPath = STORAGE_FOLDER + player.DocFilename;
            //     if (!fs.existsSync(docPath)) {
            //         console.warn('Missing file: ', player.DocFilename);
            //         //player.DocFilename = null;
            //     }
            // }
            return { player: player, photo: photo };
        }
        else {
            return null;
        }
    }
    catch (err) {
        console.error(err);
        throw 'Unexpected error!';
    }
}

async function addPlayer(teamId, stepId, season, person, roleId, caretaker, comments, isResident, photo, doc) {
    let personEntity = await personMgr.getPersonByIdCardNr(person.docId);
    //console.log('Person: ', personEntity);
    if (personEntity) {
        personEntity = personEntity[personEntity.length - 1];
        if (await playersRepo.existsPlayer(season, teamId, stepId, roleId, personEntity.Id)) {
            console.warn('Player already exists!');
            return -409;
        }
        await personMgr.updatePerson(person);
    } else {
        const { name, gender, birth, docId, voterNr, phoneNr, email, isLocalBorn, isLocalTown } = person;
        personEntity = await personMgr.addPerson(name, gender, birth, docId, voterNr, phoneNr, email, isLocalBorn, isLocalTown);
    }

    let caretakerEntity = null;
    if (caretaker && caretaker.docId) {
        caretakerEntity = await personMgr.getPersonByIdCardNr(caretaker.docId);
        //console.log('Caretaker: ', caretakerEntity);
        if (caretakerEntity) {
            caretakerEntity = caretakerEntity[caretakerEntity.length - 1];
            personMgr.updatePerson(caretaker);
        } else {
            caretakerEntity = await personMgr.addPerson(caretaker.name, null, null, caretaker.docId, caretaker.voterNr, caretaker.phoneNr, caretaker.email);
        }
    }

    return playersRepo.addPlayer(teamId, stepId, season, isResident, personEntity.Id, roleId,
        caretakerEntity ? caretakerEntity.Id : null,
        stringLimit(comments, validations.COMMENTS_MAX_LENGTH))
        .then(result => {
            //console.log('Add Player result:');
            //console.log(result);
            if (result.recordset && result.recordset.length > 0) {
                const playerId = result.recordset[0].Id;
                if (photo) {
                    const filename = savePlayerPhoto(photo, season, teamId, stepId, playerId);
                    playersRepo.addPhotoFile(playerId, filename);
                }
                if (doc) {
                    const filename = savePlayerDoc(doc, season, teamId, stepId, playerId);
                    playersRepo.addDocFile(playerId, filename);
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

async function updatePlayer(teamId, stepId, season, playerId, person, roleId, caretaker, comments, isResident, photo, doc) {
    try {
        //console.log('Person: ', person);
        //console.log('Caretaker: ', caretaker);

        let newCaretaker = null;
        await personMgr.updatePerson(person);

        if (caretaker) {
            let caretakerPerson = await personMgr.getPersonByIdCardNr(caretaker.docId);
            
            if (caretakerPerson) {
                caretakerPerson = caretakerPerson[caretakerPerson.length - 1];

                console.log('Updating caretaker: ', caretakerPerson.IdCardNr);
                const merge = {
                    name: caretaker.name,
                    voterNr: caretaker.voterNr,
                    phoneNr: caretaker.phoneNr,
                    email: caretaker.email,

                    id: caretakerPerson.Id,
                    gender: caretakerPerson.Gender,
                    birth: caretakerPerson.Birthdate,
                    docId: caretakerPerson.IdCardNr
                };
                await personMgr.updatePerson(merge);
                caretaker = merge;
            }
            else {
                console.log('New caretaker: ', caretaker.docId);
                newCaretaker = await personMgr.addPerson(caretaker.name, null, null, caretaker.docId, caretaker.voterNr, caretaker.phoneNr, caretaker.email);
            }
        }

        const caretakerId = newCaretaker ? newCaretaker.Id : (caretaker ? caretaker.id : null);
        await playersRepo.updatePlayer(playerId, caretakerId,
            stringLimit(comments, validations.COMMENTS_MAX_LENGTH), isResident);

        if (photo) {
            const filename = storage.saveFile(photo, season, teamId, stepId, playerId);
            playersRepo.addPhotoFile(playerId, filename);
        }
        if (doc) {
            const filename = storage.saveFile(doc, season, teamId, stepId, playerId, 'doc');
            playersRepo.addDocFile(playerId, filename);
        }
    }
    catch (err) {
        console.error(err);
        throw 'Error';
    }
}

async function removePlayer(teamId, stepId, season, playerId) {
    try {
        const result = await playersRepo.removePlayer(teamId, stepId, season, playerId);
        if (result && result.length > 0) {
            result.forEach(filename => {
                deleteFile(filename);
            });
        }
    }
    catch (err) {
        console.error(err);
        throw 'Unexpected error!';
    }
}

function deleteFile(filename) {
    var filePath = STORAGE_FOLDER + filename;
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                return console.error(err);
            }
            console.log("The file was deleted!");
        });
    }
}

async function importPlayers(teamId, stepId, season, selectedSeason, playerIds) {
    try {
        var step = await teamsMgr.getStep(stepId, season);
        var count = 0;
        await playerIds.forEach(async playerId => {
            var playerResult = await playersRepo.getPlayer(selectedSeason, teamId, stepId, playerId);
            if (playerResult.rowsAffected[0] === 1) {
                var player = playerResult.recordset[0];
                console.log('Player to import: ', player);
                if (player && (player.RoleId !== 1 || player.person.Birthdate >= step.MinDate)) {
                    if (await addPlayer(teamId, stepId, season, 
                            { docId: player.person.IdCardNr }, 
                            player.RoleId, 
                            player.caretaker ? { docId: player.caretaker.IdCardNr }: null , 
                            null, 
                            player.Resident) > 0) {
                        count++;
                    }
                }
            }
        });
    }
    catch(err){
        console.error(err);
        throw err;        
    }
    
    return count;

    // return playersRepo.importPlayers(teamId, stepId, season, selectedSeason, playerIds)
    //     .then(result => {
    //         if (result.rowsAffected && result.rowsAffected.length > 0) {

    //         }
    //     })
    //     .catch(err => {
    //         console.error(err);
    //         throw 'Unexpected error!';
    //     });
}

async function getPlayersCount(year) {
    try {
        const result = await playersRepo.getPlayersCount(year);
        return result.recordset[0];
    }
    catch (err) {
        console.error(err);
        throw 'Unexpected error!';
    }
}

async function getLocalPhoto(season, teamId, stepId, playerId) {
    const result = await getPlayer(season, teamId, stepId, playerId);
    if (result) {
        return result.photo;
    }
    else
        return null;
}

module.exports = {
    addPlayer,
    getPlayer,
    updatePlayer,
    getPlayers,
    removePlayer,
    importPlayers,
    getPlayersCount,
    getLocalPhoto
}

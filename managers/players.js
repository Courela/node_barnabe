const atob = require('atob');
const btoa = require('btoa');
const fs = require('fs');

const playersRepo = require('../repositories/players');
const teamsMgr = require('../managers/teams');
const personMgr = require('../managers/person');
//const teamsMgr = require('../managers/teams');
const googleApi = require('../authentication/googleApi');
const validations = require('../utils/validations');
const { stringLimit } = validations;

const STORAGE_FOLDER = './data/storage/';
const FILE_REGEX = /^data:(.+)\/(.+);base64,/;

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

function getPlayer(season, teamId, stepId, playerId) {
    return playersRepo.getPlayer(season, teamId, stepId, playerId)
        .then((results) => {
            //console.log(results);
            if (results.rowsAffected > 0) {
                const player = results.recordset[0];
                let photo = [];
                if (player.PhotoFilename) {
                    photo = getPhoto(player.PhotoFilename);
                }
                if (player.DocFilename) {
                    var docPath = STORAGE_FOLDER + player.DocFilename;
                    if (!fs.existsSync(docPath)) {
                        console.warn('Missing file: ', player.DocFilename);
                        //player.DocFilename = null;
                    }
                }
                return { player: player, photo: photo.toString() };
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

function getPhoto(filename) {
    let result = [];
    var photoPath = STORAGE_FOLDER + filename;
    if (fs.existsSync(photoPath)) {
        const mimeType = googleApi.getMimeType(filename);
        result = "data:" + mimeType + ";base64," + btoa(fs.readFileSync(photoPath));
    }
    else {
        console.warn('Missing file: ', filename);

        //TODO Remove when saving data handled properly
        console.log('Restoring documents...');
        googleApi.restoreDocuments();
    }
    //console.log('Photo: ' + photo.length);
    return result;
}

async function addPlayer(teamId, stepId, season, person, roleId, caretaker, comments, isResident, photo, doc) {
    let personEntity = await personMgr.getPersonByIdCardNr(person.docId);
    //console.log('Person: ', personEntity);
    if (personEntity) {
        if (await playersRepo.existsPlayer(teamId, stepId, season, personEntity.Id)) {
            console.warn('Player already exists!');
            return -409;
        }
        await personMgr.updatePerson(person);
    } else {
        const { name, gender, birth, docId, voterNr, phoneNr, email, isLocalBorn } = person;
        personEntity = await personMgr.addPerson(name, gender, birth, docId, voterNr, phoneNr, email, isLocalBorn);
    }

    let caretakerEntity = null;
    if (caretaker && caretaker.docId) {
        caretakerEntity = await personMgr.getPersonByIdCardNr(caretaker.docId);
        //console.log('Caretaker: ', caretakerEntity);
        if (caretakerEntity) {
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
            const caretakerPerson = await personMgr.getPersonByIdCardNr(caretaker.docId);
            if (caretakerPerson) {
                console.log('Updating caretaker: ', caretakerPerson.IdCardNr);
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
                console.log('New caretaker: ', caretaker.docId);
                newCaretaker = await personMgr.addPerson(caretaker.name, null, null, caretaker.docId, caretaker.voterNr, caretaker.phoneNr, caretaker.email);
            }
        }

        const caretakerId = newCaretaker ? newCaretaker.Id : (caretaker ? caretaker.id : null);
        await playersRepo.updatePlayer(playerId, caretakerId,
            stringLimit(comments, validations.COMMENTS_MAX_LENGTH), isResident);

        if (photo) {
            const filename = savePlayerPhoto(photo, season, teamId, stepId, playerId);
            playersRepo.addPhotoFile(playerId, filename);
        }
        if (doc) {
            const filename = savePlayerDoc(doc, season, teamId, stepId, playerId);
            playersRepo.addDocFile(playerId, filename);
        }
    }
    catch (err) {
        console.error(err);
        throw 'Error';
    }
}

function savePlayerPhoto(photo, season, teamId, stepId, playerId) {
    const fileExtension = getFileExtension(photo);
    const filename = [season, teamId, stepId, playerId + fileExtension].join('_');
    saveRawFile(filename, convertDataUrltoBinary(photo));
    googleApi.saveFile(STORAGE_FOLDER, filename, null);
    return filename;
}

function savePlayerDoc(doc, season, teamId, stepId, playerId) {
    const fileExtension = getFileExtension(doc);
    const filename = [season, teamId, stepId, playerId, 'doc' + fileExtension].join('_');
    saveRawFile(filename, convertDataUrltoBinary(doc));
    googleApi.saveFile(STORAGE_FOLDER, filename, null);
    return filename;
}

function getFileExtension(doc) {
    const fileType = doc.match(FILE_REGEX);
    return fileType && fileType.length > 2 ? '.' + fileType[2] : '';
}

function convertDataUrltoBinary(data) {
    data = data.replace(FILE_REGEX, '');
    var byteCharacters = atob(data);
    return str2ab(byteCharacters);
}

function saveRawFile(filename, data) {
    console.log('Saving file ' + filename)
    fs.writeFile(STORAGE_FOLDER + filename, data, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log("The file was saved!");
    });
}

function str2ab(str) {
    var idx, len = str.length, arr = new Array(len);
    for (idx = 0; idx < len; ++idx) {
        arr[idx] = str.charCodeAt(idx) & 0xFF;
    }
    return new Uint8Array(arr);
};

function removePlayer(teamId, stepId, season, playerId) {
    return playersRepo.removePlayer(teamId, stepId, season, playerId)
        .then(result => {
            if (result && result.length > 0) {
                result.forEach(filename => {
                    deleteFile(filename);
                });
            }
        })
        .catch(err => {
            console.error(err);
            throw 'Unexpected error!';
        });
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

function importPlayers(teamId, stepId, season, selectedSeason, playerIds) {
    return playersRepo.importPlayers(teamId, stepId, season, selectedSeason, playerIds)
        .then(result => {
            if (result.rowsAffected && result.rowsAffected.length > 0) {

            }
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
    removePlayer,
    importPlayers
}

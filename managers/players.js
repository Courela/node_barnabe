const playersRepo = require('../repositories/players');
const personMgr = require('../managers/person');
//const teamsMgr = require('../managers/teams');
const atob = require('atob');
const STORAGE_FOLDER = './data/storage/';
const FILE_REGEX = /^data:(.+)\/(.+);base64,/;
const fs = require('fs');

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
                const player = results.recordset[0];
                let photo = [];
                if (player.PhotoFilename) {
                    var photoPath = STORAGE_FOLDER + player.PhotoFilename;
                    if (fs.existsSync(photoPath)) { photo = fs.readFileSync(photoPath); }
                    //console.log('Photo: ' + photo.length);
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

async function addPlayer(teamId, stepId, season, person, roleId, caretaker, comments, photo, doc) {
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
        if (caretakerEntity) {
            personMgr.updatePerson(caretaker);
        } else {
            caretakerEntity = await personMgr.addPerson(caretaker.name, null, null, caretaker.docId, caretaker.voterNr, caretaker.phoneNr, caretaker.email);
        }
    }

    const resident = person.voterNr !== null ? 1 : 0;
    return playersRepo.addPlayer(teamId, stepId, season, resident, personEntity.Id, roleId, caretakerEntity ? caretakerEntity.Id : null, comments)
        .then(result => {
            //console.log('Add Player result:');
            //console.log(result);
            if (result.recordset && result.recordset.length > 0) {
                const playerId = result.recordset[0].Id;
                if (photo) {
                    const fileExtension = getFileExtension(photo);
                    const filename = [season, teamId, stepId, playerId + fileExtension].join('_');
                    saveRawFile(filename, photo);
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

async function updatePlayer(teamId, stepId, season, playerId, person, roleId, caretaker, comments, photo, doc) {
    try {
        //console.log('Person: ', person);
        //console.log('Caretaker: ', caretaker);

        let newCaretaker = null;
        await personMgr.updatePerson(person);
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

        const caretakerId = newCaretaker ? newCaretaker.Id : caretaker.id;
        await playersRepo.updatePlayer(playerId, caretakerId, comments);

        if (photo) {
            const fileExtension = getFileExtension(photo);
            const filename = [season, teamId, stepId, playerId + fileExtension].join('_');
            saveRawFile(filename, photo);
            playersRepo.addPhotoFile(playerId, filename);
        }
        if (doc) {
            const filename = savePlayerDoc(doc, season, teamId, stepId, playerId);
            playersRepo.addDocFile(playerId, filename);
        }
    }
    catch (err) {
        console.log(err);
        throw 'Error';
    }
}

function getFileExtension(doc) {
    const fileType = doc.match(FILE_REGEX);
    return fileType && fileType.length > 2 ? '.' + fileType[2] : '';
}

function savePlayerDoc(doc, season, teamId, stepId, playerId) {
    //console.log('Base64 len: ', doc.length);
    const fileExtension = getFileExtension(doc);
    //console.log('File extension: ', fileExtension);
    doc = doc.replace(FILE_REGEX, '');
    var byteCharacters = atob(doc);
    //console.log('Binary len:', byteCharacters.length);
    const filename = [season, teamId, stepId, playerId, 'doc' + fileExtension].join('_');
    saveBinaryFile(filename, byteCharacters);
    return filename;
}

function saveRawFile(filename, data) {
    console.log('Saving file ' + filename)
    fs.writeFile(STORAGE_FOLDER + filename, data, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}

function saveBinaryFile(filename, data) {
    console.log('Saving file ' + filename)
    fs.writeFile(STORAGE_FOLDER + filename, str2ab(data), function (err) {
        if (err) {
            return console.log(err);
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
                return console.log(err);
            }
            console.log("The file was deleted!");
        });
    }
}

module.exports = {
    addPlayer,
    getPlayer,
    updatePlayer,
    getPlayers,
    removePlayer
}

//const atob = require('atob');
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
                //console.log("getPlayers manager: ", results);
                return results.recordset.map((v) => Object.assign(
                    v,
                    { Person: { Id: v.PersonId, Name: v.PlayerName, Gender: v.PlayerGender, Birthdate: v.PlayerBirthdate, IdCardNr: v.PlayerIdCardNr }},
                    { Caretaker: { Id: v.CareTakerId, Name: v.CareTakerName }},
                    { Role: { Id: v.RoleId, Description: v.RoleDescription }},
                    { Step: { Id: v.StepId, Season: v.Season, Gender: v.StepGender, IsCaretakerRequired: v.StepIsCareTakerRequired, MinDate: v.MinDate, MaxDate: v.MaxDate }}
                ));
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
                // let photo = [];
                // if (player.PhotoFilename) {
                //     const folder = [season, teamId, stepId].join('_');
                //     photo = getPhoto(folder, player.PhotoFilename);
                // }
                // if (player.DocFilename) {
                //     var docPath = STORAGE_FOLDER + player.DocFilename;
                //     if (!fs.existsSync(docPath)) {
                //         console.warn('Missing file: ', player.DocFilename);
                //         //player.DocFilename = null;
                //     }
                // }

                if (player.Photo) {
                    player.Photo = btoa(player.Photo);
                }

                return Object.assign(player, 
                    { Player: { Id: player.Id, PhotoFilename: player.PhotoFilename, DocFilename: player.DocFilename, RoleId: player.RoleId, CareTakerId: player.CareTakerId, Resident: player.Resident, LocalBorn: player.PlayerLocalBorn, LocalTown: player.PlayerLocalTown, step: { Id: player.StepId, Description: player.StepDescription, IsCaretakerRequired: player.StepIsCaretakerRequired } }, 
                      Person: { Id: player.PersonId, Name: player.PlayerName, Gender: player.PlayerGender, Birthdate: player.PlayerBirthdate, IdCardNr: player.PlayerIdCardNr, VoterNr: player.PlayerVoterNr, Email: player.PlayerEmail, Phone: player.PlayerPhone, },
                      Caretaker: { CareTakerId: player.CareTakerId, Name: player.CareTakerName, IdCardNr: player.CareTakerIdCardNr, VoterNr: player.CareTakerVoterNr, Email: player.CareTakerEmail, Phone: player.CareTakerPhone },
                      Role: { Id: player.RoleId, Description: player.RoleDescription },
                      Step: { Id: player.StepId, Description: player.StepDescription, IsCaretakerRequired: player.StepIsCaretakerRequired, MinDate: player.StepMinDate, MaxDate: player.StepMaxDate }}
                )
                //return { player: player, photo: photo };
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

function getPhoto(folder, filename) {
    var photoPath = STORAGE_FOLDER + filename;
    const mimeType = googleApi.getMimeType(filename);

    let result = { src: null, existsLocally: fs.existsSync(photoPath) };
    if (result.existsLocally) {
        result.src = "data:" + mimeType + ";base64," + btoa(fs.readFileSync(photoPath));
    }
    else {
        console.warn('Missing file: ', filename);
        //TODO Remove when saving data handled properly
        console.log('Restoring photo ' + folder + '/'+ filename +'...');

        googleApi.getRemoteFile(folder, filename, mimeType, true, (data) => saveRawFile(filename, data));
        result.src = '/show_loader.gif';
    }
    //console.log('Photo: ' + photo.length);
    return result;
}

async function addPlayer(teamId, stepId, season, person, roleId, caretaker, comments, isResident, photo, doc) {
    let personEntity = await personMgr.getPersonByIdCardNr(person.docId);
    //console.log('addPlayer person with idCardNr '+ person.docId + ': ', personEntity);
    if (personEntity) {
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
        //console.log('addPlayer manager caretaker with docId '+ caretaker.docId + ':', caretakerEntity);
        if (caretakerEntity) {
            //caretakerEntity = caretakerEntity[caretakerEntity.length - 1];
            personMgr.updatePerson(Object.assign(caretaker, {id: caretakerEntity.Id}));
        } else {
            caretakerEntity = await personMgr.addPerson(caretaker.name, null, null, caretaker.docId, caretaker.voterNr, caretaker.phoneNr, caretaker.email);
        }
    }

    return playersRepo.addPlayer(teamId, stepId, season, isResident, personEntity.Id, roleId,
        caretakerEntity ? caretakerEntity.Id : null,
        stringLimit(comments, validations.COMMENTS_MAX_LENGTH))
        .then(result => {
            //console.log('addPlayer manager:', result);
            if (result.recordset && result.recordset.insertId > 0) {
                const playerId = result.recordset.insertId;
                if (photo) {
                    const fileType = photo.match(FILE_REGEX);
                    const fileExtension = fileType && fileType.length > 2 ? '.' + fileType[2] : '';
                    const filename = [season, teamId, stepId, playerId + fileExtension].join('_');
                    //playersRepo.addPhotoFile(playerId, filename);
                    playersRepo.addPhoto(playerId, filename, photo);
                    
                    //const filename = savePlayerPhoto(photo, season, teamId, stepId, playerId);
                    //playersRepo.addPhotoFile(playerId, filename);
                }
                // if (doc) {
                //     const filename = savePlayerDoc(doc, season, teamId, stepId, playerId);
                //     playersRepo.addDocFile(playerId, filename);
                // }
                return playerId;
            }
            else { return result.affectedRows; }
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
                //caretakerPerson = caretakerPerson[caretakerPerson.length - 1];

                //console.log('Updating caretaker: ', caretakerPerson.IdCardNr);
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
                //console.log('New caretaker: ', caretaker.docId);
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
    const folder = [season, teamId, stepId].join('_');
    const filename = [season, teamId, stepId, playerId + fileExtension].join('_');
    saveBuffer(filename, photo);
    
    //saveStream(filename, photo);

    googleApi.uploadFile(STORAGE_FOLDER, filename, folder, null);
    return filename;
}

function savePlayerDoc(doc, season, teamId, stepId, playerId) {
    const fileExtension = getFileExtension(doc);
    const filename = [season, teamId, stepId, playerId, 'doc' + fileExtension].join('_');
    
    saveBuffer(filename, doc);
    googleApi.saveFile(STORAGE_FOLDER, filename, null);
    return filename;
}

function getFileExtension(doc) {
    const fileType = doc.match(FILE_REGEX);
    return fileType && fileType.length > 2 ? '.' + fileType[2] : '';
}

function saveBuffer(filename, photo) {
    var buf = Buffer.from(photo.replace(FILE_REGEX, ''), 'base64');
    saveRawFile(filename, buf);
}

// function saveStream(filename, photo) {
//     let writeStream = fs.createWriteStream(STORAGE_FOLDER + filename);
//     writeStream.write(photo.replace(FILE_REGEX, ''), 'base64');
// }

function saveRawFile(filename, data) {
    console.log('Saving file ' + filename)
    fs.writeFile(STORAGE_FOLDER + filename, data, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log("The file was saved!");
    });
}

// function convertDataUrltoBinary(data) {
//     data = data.replace(FILE_REGEX, '');
//     var byteCharacters = atob(data);
//     return str2ab(byteCharacters);
// }

// function str2ab(str) {
//     var idx, len = str.length, arr = new Array(len);
//     for (idx = 0; idx < len; ++idx) {
//         arr[idx] = str.charCodeAt(idx) & 0xFF;
//     }
//     return new Uint8Array(arr);
// };

function removePlayer(teamId, stepId, season, playerId) {
    return playersRepo.removePlayer(teamId, stepId, season, playerId)
        .then(result => {
            console.log("Removed player: ", playerId, result);
            // if (result && result.length > 0) {
            //     result.forEach(filename => {
            //         deleteFile(filename);
            //     });
            // }
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

async function importPlayers(teamId, stepId, season, selectedSeason, playerIds) {
    try {
        var step = await teamsMgr.getStep(stepId, season);
        var count = 0;
        await playerIds.forEach(async playerId => {
            var playerResult = await playersRepo.getPlayer(selectedSeason, teamId, stepId, playerId);
            if (playerResult.rowsAffected[0] === 1) {
                var player = playerResult.recordset[0];
                //console.log('Player to import: ', player);
                if (player && (player.RoleId !== 1 || player.PlayerBirthdate >= step.MinDate)) {
                    if (await addPlayer(teamId, stepId, season, 
                            { 
                                id: player.PersonId, name: player.PlayerName, gender: player.PlayerGender, birth: player.PlayerBirthdate, 
                                docId: player.PlayerIdCardNr, voterNr: player.PlayerVoterNr
                            }, 
                            player.RoleId, 
                            player.CareTakerIdCardNr ? { docId: player.CareTakerIdCardNr }: null , 
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
        return Promise.reject(err);        
    }
    
    return Promise.resolve(count);

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

function getPlayersCount(year) {
    return playersRepo.getPlayersCount(year)
        .then(result => result.recordset[0])
        .catch(err => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

function getLocalPhoto(season, teamId, stepId, playerId) {
    return getPlayer(season, teamId, stepId, playerId)
        .then(result => {
            if (result) {
                return result.photo;
            }
            else return null;
        });
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

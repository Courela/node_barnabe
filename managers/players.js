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

// const STORAGE_FOLDER = './data/storage/';
const FILE_REGEX = /^data:(.+)\/(.+);base64,/;

async function getPlayers(season, teamId, stepId, roles) {
    const teamSteps = await teamsMgr.getTeamSteps(season, teamId, false);
    const step = teamSteps.find(s => s.Id === stepId);
    if (step) {
        return playersRepo.getPlayers(season, teamId, stepId, roles)
            .then((results) => {
                //console.log("getPlayers manager: ", results);
                
                return results.recordset.map((v) => {
                    delete v.Photo;
                    delete v.Doc;
                    return Object.assign(
                        v,
                        { Person: { Id: v.PersonId, Name: v.PlayerName, Gender: v.PlayerGender, Birthdate: v.PlayerBirthdate, IdCardNr: v.PlayerIdCardNr }},
                        { Caretaker: { Id: v.CareTakerId, Name: v.CareTakerName }},
                        { Role: { Id: v.RoleId, Description: v.RoleDescription }},
                        { Step: { Id: v.StepId, Season: v.Season, Gender: v.StepGender, IsCaretakerRequired: v.StepIsCareTakerRequired, MinDate: v.MinDate, MaxDate: v.MaxDate }}
                    );
                });
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
            if (results.rowsAffected > 0) {
                const player = results.recordset[0];
                if (player.DocFilename) {
                    var docPath = googleApi.STORAGE_FOLDER + player.DocFilename;
                    if (!fs.existsSync(docPath)) {
                        console.warn('Missing file: ', player.DocFilename);
                        //player.DocFilename = null;
                    }
                }

                // if (player.Photo) {
                //     player.Photo = btoa(player.Photo);
                // }
                // if (player.Doc) {
                //     player.Doc = btoa(player.Doc);
                // }

                delete player.Photo;
                delete player.Doc;

                return Object.assign(player, 
                    { Player: { Id: player.Id, PhotoFilename: player.PhotoFilename, DocFilename: player.DocFilename, RoleId: player.RoleId, CareTakerId: player.CareTakerId, Resident: player.Resident, LocalBorn: player.PlayerLocalBorn, LocalTown: player.PlayerLocalTown, step: { Id: player.StepId, Description: player.StepDescription, IsCaretakerRequired: player.StepIsCaretakerRequired } }, 
                      Person: { Id: player.PersonId, Name: player.PlayerName, Gender: player.PlayerGender, Birthdate: player.PlayerBirthdate, IdCardNr: player.PlayerIdCardNr, VoterNr: player.PlayerVoterNr, Email: player.PlayerEmail, Phone: player.PlayerPhone, LocalBorn: player.PlayerLocalBorn, LocalTown: player.PlayerLocalTown },
                      Caretaker: { CareTakerId: player.CareTakerId, Name: player.CareTakerName, IdCardNr: player.CareTakerIdCardNr, VoterNr: player.CareTakerVoterNr, Email: player.CareTakerEmail, Phone: player.CareTakerPhone },
                      Role: { Id: player.RoleId, Description: player.RoleDescription },
                      Step: { Id: player.StepId, Description: player.StepDescription, IsCaretakerRequired: player.StepIsCaretakerRequired, MinDate: player.StepMinDate, MaxDate: player.StepMaxDate }}
                )
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

async function addPlayer(teamId, stepId, season, person, roleId, caretaker, comments, isResident, photo, doc) {
    let personEntity = await personMgr.getPersonByIdCardNr(person.IdCardNr);
    if (personEntity) {
        if (await playersRepo.existsPlayer(season, teamId, stepId, roleId, personEntity.Id)) {
            console.warn('Player already exists ' +
                '[Person.Id: ' + personEntity.Id + 
                '; Season.Year: ' + season + 
                '; Team.Id: ' + teamId + 
                '; Step.Id: ' + stepId + ']!');
            return -409;
        }
        await personMgr.updatePerson(person);
    } else {
        const { Name, Gender, Birthdate, IdCardNr, VoterNr, Phone, Email, LocalBorn, LocalTown } = person;
        personEntity = await personMgr.addPerson(Name, Gender, Birthdate, IdCardNr, VoterNr, Phone, Email, LocalBorn, LocalTown);
    }

    let caretakerEntity = null;
    if (caretaker && caretaker.IdCardNr) {
        caretakerEntity = await personMgr.getPersonByIdCardNr(caretaker.IdCardNr);
        if (caretakerEntity) {
            personMgr.updatePerson(Object.assign(caretaker, { Id: caretakerEntity.Id}));
        } else {
            caretakerEntity = await personMgr.addPerson(caretaker.Name, null, '1970-01-01', caretaker.IdCardNr, caretaker.VoterNr, caretaker.Phone, caretaker.Email);
        }
    }

    return playersRepo.addPlayer(teamId, stepId, season, isResident, personEntity.Id, roleId,
        caretakerEntity ? caretakerEntity.Id : null,
        stringLimit(comments, validations.COMMENTS_MAX_LENGTH))
        .then(result => {
            if (result.recordset && result.recordset.insertId > 0) {
                const playerId = result.recordset.insertId;
                if (photo) {
                    addPhoto(season, teamId, stepId, playerId, photo);
                }
                if (doc) {
                    const filename = savePlayerDoc(doc, season, teamId, stepId, playerId);
                    playersRepo.addDocument(playerId, filename);
                    //addDocument(season, teamId, stepId, playerId, doc);
                }
                return playerId;
            }
            else { return result.rowsAffected; }
        })
        .catch((err) => {
            console.error(err);
            const res = err.name == 'RequestError' ? -409 : -500;
            return res;
        });
}

function addPhoto(season, teamId, stepId, playerId, photo) {
    const fileType = photo.match(FILE_REGEX);
    const fileExtension = fileType && fileType.length > 2 ? '.' + fileType[2] : '';
    const filename = [season, teamId, stepId, playerId + fileExtension].join('_');
    playersRepo.addPhoto(playerId, filename, photo);
}

function addDocument(season, teamId, stepId, playerId, doc) {
    const fileType = doc.match(FILE_REGEX);
    const fileExtension = fileType && fileType.length > 2 ? '.' + fileType[2] : '';
    const filename = [season, teamId, stepId, playerId, "doc" + fileExtension].join('_');
    playersRepo.addDocument(playerId, filename, doc);
}

async function updatePlayer(teamId, stepId, season, playerId, person, roleId, caretaker, comments, isResident, photo, doc) {
    try {
        let newCaretaker = null;
        await personMgr.updatePerson(person);

        if (caretaker) {
            let caretakerPerson = await personMgr.getPersonByIdCardNr(caretaker.IdCardNr);
            
            if (caretakerPerson) {
                const merge = {
                    Name: caretaker.Name,
                    VoterNr: caretaker.VoterNr,
                    Phone: caretaker.Phone,
                    Email: caretaker.Email,

                    Id: caretakerPerson.Id,
                    Gender: caretakerPerson.Gender,
                    Birthdate: caretakerPerson.Birthdate,
                    IdCardNr: caretakerPerson.IdCardNr,
                    LocalBorn: caretakerPerson.LocalBorn,
                    LocalTown: caretakerPerson.LocalTown
                };
                await personMgr.updatePerson(merge);
                caretaker = merge;
            }
            else {
                newCaretaker = await personMgr.addPerson(caretaker.Name, null, caretaker.Birthdate ? caretaker.Birthdate : '1900-01-01', caretaker.IdCardNr, caretaker.VoterNr, caretaker.Phone, caretaker.Email, caretaker.LocalBorn, caretaker.LocalTown);
            }
        }

        const caretakerId = newCaretaker ? newCaretaker.Id : (caretaker ? caretaker.Id : null);
        await playersRepo.updatePlayer(playerId, caretakerId,
            stringLimit(comments, validations.COMMENTS_MAX_LENGTH), isResident);

        if (photo) {
            addPhoto(season, teamId, stepId, playerId, photo);
        }
        if (doc) {
            const filename = savePlayerDoc(doc, season, teamId, stepId, playerId);
            playersRepo.addDocument(playerId, filename);
            //addDocument(season, teamId, stepId, playerId, doc);
        }
    }
    catch (err) {
        console.error(err);
        throw 'Error';
    }
}

function removePlayer(teamId, stepId, season, playerId) {
    return playersRepo.removePlayer(teamId, stepId, season, playerId)
        .then(result => {
            console.log("Removed player: ", playerId, result);
        })
        .catch(err => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

async function importPlayers(teamId, stepId, season, selectedSeason, playerIds) {
    var count = 0;
    try {
        var step = await teamsMgr.getStep(stepId, season);
        for (let index = 0; index < playerIds.length; index++) {
            const playerId = playerIds[index];            
            var player = await getPlayer(selectedSeason, teamId, stepId, playerId);
            if (player && (player.RoleId !== 1 || player.Person.Birthdate >= step.MinDate)) {
                var id = await addPlayer(teamId, stepId, season, 
                    player.Person, 
                    player.RoleId, 
                    player.CareTaker,
                    player.Comments, 
                    player.Resident);
                if (id > 0) {
                    count++;
                    console.log("Added player " + id);
                } else {
                    console.log("Player not added: " + playerId);
                }
            }
        };
    }
    catch(err){
        console.error(err);
        return err;        
    }
    
    console.log("Imported players: " + count);
    return count;
}

function getPlayersCount(year) {
    return playersRepo.getPlayersCount(year)
        .then(result => result.recordset[0])
        .catch(err => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

function getPhoto(playerId) {
    return playersRepo.getPhoto(playerId)
        .then(r => { 
            if (r.recordset.Photo) {
                return btoa(r.recordset.Photo);
            }
            return null;
        })
        .catch((err) => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

function savePlayerDoc(doc, season, teamId, stepId, playerId) {
    const fileExtension = getFileExtension(doc);
    //const folder = [season, teamId, stepId].join('_');
    const filename = [season, teamId, stepId, playerId, 'doc' + fileExtension].join('_');
    
    saveBuffer(filename, doc);
    googleApi.saveFile(googleApi.STORAGE_FOLDER, filename, null);
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

function saveRawFile(filename, data) {
    console.log('Saving file ' + filename)
    fs.writeFile(googleApi.STORAGE_FOLDER + filename, data, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log("The file was saved!");
    });
}

function getDocumentFilename(playerId) {
    return playersRepo.getDocumentFilename(playerId)
        .then(r => { 
            // console.log("playerMgr.getDocumentFilename: ", r);
            if (r.recordset.DocFilename) {
                return r.recordset.DocFilename;
            }
            return null;
        })
        .catch((err) => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

function getDocument(folder, filename) {
    var docPath = googleApi.STORAGE_FOLDER + filename;
    const mimeType = googleApi.getMimeType(filename);

    let result = { Src: null, ExistsLocally: fs.existsSync(docPath) };
    if (result.ExistsLocally) {
        result.Src = "data:" + mimeType + ";base64," + btoa(fs.readFileSync(docPath));
    }
    else {
        console.warn('Missing file: ', filename);
        //TODO Remove when saving data handled properly
        console.log('Restoring document ' + folder + '/'+ filename +'...');

        googleApi.getRemoteFile(folder, filename, mimeType, true, (data) => saveRawFile(filename, data));
        result.Src = '/show_loader.gif';
    }
    //console.log('Photo: ' + photo.length);
    return result;
}

// function getDocument(playerId) {
//     return playersRepo.getDocument(playerId)
//         .then(r => { 
//             // if (r.recordset.Doc) {
//             //     return btoa(r.recordset.Doc);
//             // }
//             if (r.recordset.DocFilename) {
                
//             }
//             return null;
//         })
//         .catch((err) => {
//             console.error(err);
//             throw 'Unexpected error!';
//         });
// }

module.exports = {
    addPlayer,
    getPlayer,
    updatePlayer,
    getPlayers,
    removePlayer,
    importPlayers,
    getPlayersCount,
    getPhoto,
    getDocument,
    getDocumentFilename
}

const btoa = require('btoa');
const fs = require('fs');

const playersRepo = require('../repositories/players');
const teamsMgr = require('../managers/teams');
const personMgr = require('../managers/person');
const googleApi = require('../authentication/googleApi');
const validations = require('../utils/validations');
const { stringLimit } = validations;

const FILE_REGEX = /^data:(.+)\/(.+);base64,/;

async function getPlayers(season, teamId, stepId, roles) {
    const teamSteps = await teamsMgr.getTeamSteps(season, teamId, false);
    const step = teamSteps.find(s => s.StepId === stepId);
    if (step) {
        return playersRepo.getPlayers(season, teamId, stepId, roles)
            .then((results) => {                
                return results.recordset.map((v) => {
                    delete v.Photo;
                    delete v.Doc;
                    return Object.assign(
                        v,
                        { Person: { Id: v.PersonId, Name: v.PlayerName, Gender: v.PlayerGender, Birthdate: v.PlayerBirthdate, IdCardNr: v.PlayerIdCardNr }},
                        { Caretaker: { Id: v.CareTakerId, Name: v.CareTakerName, IdCardNr: v.CareTakerIdCardNr }},
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
        return null;
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
                        console.log('Getting file ' + player.DocFilename);
                    }
                }

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
                    addDocument(season, teamId, stepId, playerId, doc);
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
            playersRepo.addDocument(playerId, filename, doc);
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
            var player = await getPlayer(selectedSeason, teamId, null, playerId);
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
    const fileExtension = getFileExtension(doc ? doc.substring(0, 50) : '');
    const filename = [season, teamId, stepId, playerId, 'doc' + fileExtension].join('_');
    console.log("Going to save file " + filename + "...")
    new Promise((resolve, _) => resolve(saveFile(filename, doc)));
    return filename;
}

function getFileExtension(doc) {
    console.log("Getting file extension...");
    const fileType = doc.match(FILE_REGEX);
    console.log('File type is ' + fileType);
    return fileType && fileType.length > 2 ? '.' + fileType[2] : '';
}

function saveFile(filename, doc) {
    return new Promise((resolve, reject) => {
        try {
            saveBuffer(filename, doc);
        } catch(err) {
            reject(err);
        }
        resolve();
    });
}

function saveBuffer(filename, photo) {
    var buf = Buffer.from(photo.replace(FILE_REGEX, ''), 'base64');
    saveRawFile(filename, buf);
}

function saveRawFile(filename, data) {
    console.log('Saving file ' + filename)
    fs.writeFile(googleApi.STORAGE_FOLDER + filename, Buffer.from(data), function (err) {
        if (err) {
            return console.error(err);
        }
        console.log("The file was saved!");
    });
}

function getDocumentFilename(playerId) {
    return playersRepo.getDocumentFilename(playerId)
        .then(r => { 
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

function getDocument(playerId) {
    return playersRepo.getDocument(playerId)
        .then(r => {
            if (r.recordset && r.recordset.Doc) {
                return btoa(r.recordset.Doc);
            }
            if (r.recordset && r.recordset.DocFilename) {
                return "";
            }
            return null;
        })
        .catch((err) => {
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
    importPlayers,
    getPlayersCount,
    getPhoto,
    getDocument,
    getDocumentFilename
}

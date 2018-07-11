const fs = require('fs');
const { google } = require('googleapis');
const oAuth2 = require('./oAuth2');
const storage = require('../db/storage');

const DATA_FOLDER = './data/';
const DB_FILE = 'db.json';
const USERS_FILE = 'users.json';

function saveData(responseCallback) {
    saveFile(DB_FILE, 'application/json', responseCallback);
}

function restoreData(responseCallback) {
    getFile(DB_FILE, 'application/json', storage.restoreDb, responseCallback);
}

function saveUsers(responseCallback) {
    saveFile(USERS_FILE, 'application/json', responseCallback);
}

function restoreUsers(responseCallback) {
    getFile(USERS_FILE, 'application/json', storage.restoreUsers, responseCallback);
}

function getAppFolder(driveClient, callback, responseCallback) {
    const res = driveClient.files.list({
        q: "mimeType = 'application/vnd.google-apps.folder' and name = 'TacaBarnabe'",
        fields: 'files(id, name)',
        spaces: 'drive'
    }, (err, res) => {
        if (err || !res || res.data.files.length < 1) {
            console.log(err);
            responseCallback({ isSuccess: false });
            return null;
        }
        console.log(res.data.files);
        callback(res.data.files[0]);
    });
    return null;
}

function saveFile(filename, mimeType, responseCallback) {
    const oAuth2Client = oAuth2.authorize();
    if (oAuth2Client) {
        console.log('Saving file ' + filename + ' to Drive...');
        const driveClient = google.drive({ version: 'v3', auth: oAuth2Client });
        getAppFolder(driveClient,
            (folder) => {
                var fileMetadata = {
                    'name': filename,
                    parents: [folder.id]
                };
                var media = {
                    mimeType: mimeType,
                    body: fs.createReadStream(DATA_FOLDER + filename)
                };
                driveClient.files.create({
                    resource: fileMetadata,
                    media: media,
                    fields: 'id'
                }, (err, res) => {
                    if (err) {
                        console.log(err);
                        responseCallback({ isSuccess: false });
                        return;
                    }
                    console.log('File id: ', res.data.id);
                    responseCallback({ isSuccess: true });
                });
            },
            responseCallback);
    }
    else {
        responseCallback({ isSuccess: false, error: 'Failed to save file ' + filename + '!' });
    }
}

function getFile(filename, mimeType, callback, responseCallback) {
    const oAuth2Client = oAuth2.authorize();
    if (oAuth2Client) {
        console.log('Getting file ' + filename + ' from Drive...');
        const driveClient = google.drive({ version: 'v3', auth: oAuth2Client });
        getAppFolder(driveClient,
            (folder) => {
                driveClient.files.list({
                    q: "'" + folder.id + "' in parents and mimeType='" + mimeType + "' and name = '" + filename + "'",
                    fields: 'files(id, name)',
                    spaces: 'drive',
                    orderBy: 'createdTime desc'
                }, (err, res) => {
                    if (err) {
                        console.log(err);
                        responseCallback({ isSuccess: false });
                        return;
                    }
                    console.log('Files: ', res.data.files);

                    if (res.data.files && res.data.files.length > 0) {
                        var fileId = res.data.files[0].id;
                        responseCallback({ isSuccess: true });
                        driveClient.files.get({
                            fileId: fileId,
                            alt: 'media'
                        }, (err, res) => {
                            if (err) { 
                                console.log(err); 
                                responseCallback({ isSuccess: false}); 
                            }

                            console.log(res.data);
                            try {
                                callback(res.data);
                                responseCallback({ isSuccess: true });
                            }
                            catch(err) {
                                console.log(err);
                                responseCallback({ isSuccess: false }); 
                            }
                        });
                            // .on('end', function () {
                            //     console.log('Restore of' + filename + ' done.');
                            //     responseCallback({ isSuccess: true });
                            // })
                            // .on('error', function (err) {
                            //     console.log('Error during download file ' + filename + ': ', err);
                            //     responseCallback({ isSuccess: false });
                            // })
                            // .pipe(dest);
                    }
                    else {
                        console.log('No file found to restore!');
                        responseCallback({ isSuccess: false, error: 'No file found to restore!' });
                    }
                });
            },
            responseCallback);
    }
    else {
        responseCallback({ isSuccess: false, error: 'Failed to restore file ' + filename + '!' });
    }
}

module.exports = {
    saveData,
    restoreData,
    saveUsers,
    restoreUsers
}

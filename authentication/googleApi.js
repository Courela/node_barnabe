const fs = require('fs');
const { google } = require('googleapis');
const oAuth2 = require('./oAuth2');
const storage = require('../db/storage');

//const DRIVE_FOLDER = process.env.DRIVE_FOLDER || 'TacaBarnabe';
const DRIVE_FOLDER = process.env.NODE_ENV == 'production' ? 'TacaBarnabe' : 'TacaBarnabeDev';
const DATA_FOLDER = './data/';
const STORAGE_FOLDER = './data/storage/';
const DB_FILE = 'db.json';
const USERS_FILE = 'users.json';

function saveData(responseCallback) {
    saveFile(DATA_FOLDER, DB_FILE, responseCallback);
}

function restoreData(responseCallback) {
    getFile(DB_FILE, 'application/json', storage.restoreDb, responseCallback);
}

function saveUsers(responseCallback) {
    saveFile(DATA_FOLDER, USERS_FILE, responseCallback);
}

function restoreUsers(responseCallback) {
    getFile(USERS_FILE, 'application/json', storage.restoreUsers, responseCallback);
}

function saveDocuments(responseCallback) {
    try {
        const files = fs.readdirSync(STORAGE_FOLDER);
        for(let i = 0; i < files.length; i++) {
            const filename = files[i];
            if (filename === '.' || filename === '..') { continue; }
            saveFile(STORAGE_FOLDER, filename);
        }
        if (responseCallback) { responseCallback({ isSuccess: true }); return; }
    }
    catch (err) {
        console.log(err);
        if (responseCallback) { responseCallback({ isSuccess: false }); return; }
    }
}

function restoreDocuments(responseCallback) {
    try {
        const oAuth2Client = oAuth2.authorize();
        if (oAuth2Client) {
            const driveClient = google.drive({ version: 'v3', auth: oAuth2Client });
            getAppFolder(driveClient, (folder) => {
                listFiles(folder, driveClient, (files) => {
                    for(let i = 0; i < files.length; i++) {
                        const fileId = files[i].id;
                        const filename = files[i].name;
                        if (filename === '.' || filename === '..') { continue; }
                        getFileById(driveClient, fileId, (data) => {
                            try {
                                fs.writeFileSync(STORAGE_FOLDER + filename, data);
                            }
                            catch(err) {
                                console.error(err);
                            }
                        }, responseCallback);
                    }

                    if (responseCallback) { responseCallback({ isSuccess: true }); return; }
                }, 
                responseCallback);
            },
            responseCallback);
        }
        else {
            if (responseCallback) { responseCallback({ isSuccess: false }); return; }    
        }
    }
    catch (err) {
        console.error(err);
        if (responseCallback) { responseCallback({ isSuccess: false }); return; }
    }
}

function getAppFolder(driveClient, callback, responseCallback) {
    driveClient.files.list({
        q: "mimeType = 'application/vnd.google-apps.folder' and name = '" + DRIVE_FOLDER + "'",
        fields: 'files(id, name)',
        spaces: 'drive'
    }, (err, res) => {
        if (err || !res || res.data.files.length < 1) {
            console.log(err);
            if (responseCallback) { responseCallback({ isSuccess: false }); }
            return;
        }
        console.log(res.data.files);
        if (callback) { 
            callback(res.data.files[0], responseCallback); 
        }
    });
}

function listFiles(folder, driveClient, callback, responseCallback) {
    driveClient.files.list({
        q: "'" + folder.id + "' in parents and (mimeType contains 'image/' or mimeType = 'application/pdf')",
        fields: 'files(id, name)',
        spaces: 'drive'
    }, (err, res) => {
        if (err || !res || res.data.files.length < 1) {
            console.log(err);
            if (responseCallback) { responseCallback({ isSuccess: false }); }
            return;
        }
        console.log('Files from Drive: ', res.data.files);
        if (callback) { callback(res.data.files); }
    });
    return;
}

function saveFile(filePath, filename, responseCallback) {
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
                    body: fs.createReadStream(filePath + filename)
                };
                var mimeType = getMimeType(filename);
                if (mimeType) { media.mimeType = mimeType }
                driveClient.files.create({
                    resource: fileMetadata,
                    media: media,
                    fields: 'id'
                }, (err, res) => {
                    if (err) {
                        console.log(err);
                        if (responseCallback) { responseCallback({ isSuccess: false }); }
                        return;
                    }
                    console.log('File id: ', res.data.id);
                    if (responseCallback) { responseCallback({ isSuccess: true }); }
                    return;
                });
            },
            responseCallback);
    }
    else {
        if (responseCallback) { responseCallback({ isSuccess: false, error: 'Failed to save file ' + filename + '!' }); }
    }
}

function getMimeType(filename) {
    let result = null;
    const fileType = filename.match(/.+\.(.+)$/);
    if (fileType && fileType.length > 1) {
        switch(fileType[1]) {
            case 'pdf':
            case 'json':
                result = 'application/' + fileType[1];
                break;
            case 'png':
            case 'gif':
            case 'jpeg':
                result = 'image/' + fileType[1];
                break;
            case 'jpg':
                result = 'image/jpeg';
                break;
            default:
                break;
        }
    }
    return result;
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
                        if (responseCallback) { responseCallback({ isSuccess: false }); }
                        return;
                    }
                    console.log('Files: ', res.data.files);

                    if (res.data.files && res.data.files.length > 0) {
                        var fileId = res.data.files[0].id;
                        getFileById(driveClient, fileId, callback, responseCallback);
                        return;
                    }
                    else {
                        console.log('No file found to restore!');
                        if (responseCallback) { responseCallback({ isSuccess: false, error: 'No file found to restore!' }); }
                        return;
                    }
                });
            },
            responseCallback);
    }
    else {
        if (responseCallback) { responseCallback({ isSuccess: false, error: 'Failed to restore file ' + filename + '!' }); }
    }
}

function getFileById(driveClient, fileId, callback, responseCallback) {
    driveClient.files.get({
        fileId: fileId,
        alt: 'media'
    }, (err, res) => {
        if (err) { 
            console.log(err); 
            if (responseCallback) { responseCallback({ isSuccess: false}); }
            return; 
        }

        console.log('FileId successfully returned: ', fileId);
        try {
            if (callback) { callback(res.data, responseCallback); return; }
            if (responseCallback) { responseCallback({ isSuccess: true }); }
            return;
        }
        catch(err) {
            console.log(err);
            if (responseCallback) { responseCallback({ isSuccess: false }); }
            return; 
        }
    });
}

function invokeCallbacks(callbacks, parameters) {
    if (callbacks && callbacks.length > 0) {
        const callbackParams = parameters && parameters.length > 0 ? parameters[0] : null; 
        const remainingParams = parameters && parameters.length > 1 ? parameters.slice(1) : null;
        callbacks[0].apply(null, callbackParams, callbacks.slice(1), remainingParams);
    }
}

module.exports = {
    saveData,
    restoreData,
    saveUsers,
    restoreUsers,
    saveDocuments,
    restoreDocuments
}

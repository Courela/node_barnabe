const fs = require('fs');
const { google } = require('googleapis');
const atob = require('atob');
//const authClient = require('./oAuth2');
const authClient = require('./jwt');
const storage = require('../db/storage');

const DRIVE_FOLDER = process.env.NODE_ENV == 'production' ? 'TacaBarnabe' : 'TacaBarnabeDev';
const DATA_FOLDER = './data/';
const STORAGE_FOLDER = './data/storage/';
const DB_FILE = 'db.json';
const USERS_FILE = 'users.json';
const DRIVE_API_VERSION = 'v3';
const FOLDER_EXTENSION = '.folder';

function saveData(responseCallback) {
    saveFile(DATA_FOLDER, DB_FILE, responseCallback);
}

function restoreData(responseCallback) {
    getFile(DB_FILE, 'application/json', false, storage.restoreDb, responseCallback);
}

function saveUsers(responseCallback) {
    saveFile(DATA_FOLDER, USERS_FILE, responseCallback);
}

function restoreUsers(responseCallback) {
    getFile(USERS_FILE, 'application/json', false, storage.restoreUsers, responseCallback);
}

function saveDocuments(responseCallback) {
    try {
        const files = fs.readdirSync(STORAGE_FOLDER);
        for (let i = 0; i < files.length; i++) {
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

async function restoreDocuments(responseCallback) {
    try {
        const client = await authClient.authorize();
        if (client) {
            const driveClient = google.drive({ version: DRIVE_API_VERSION, auth: client });
            getAppFolder(driveClient, (folder) => {
                listFiles(folder, driveClient, (files) => {
                    for (let i = 0; i < files.length; i++) {
                        const fileId = files[i].id;
                        const filename = files[i].name;
                        if (filename === '.' || filename === '..' || fs.existsSync(STORAGE_FOLDER + filename)) {
                            continue;
                        }

                        getFileById(driveClient, fileId, true, (data) => {
                            try {
                                saveAsBinary(data, filename);
                            }
                            catch (err) {
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
    getFolder(driveClient, DRIVE_FOLDER, callback, responseCallback);
}

function getFolder(driveClient, folder, callback, responseCallback) {
    driveClient.files.list({
        q: "mimeType = 'application/vnd.google-apps.folder' and name = '" + folder + "'",
        //q: "mimeType = 'application/vnd.google-apps.folder'",
        fields: 'files(id, name)',
        spaces: 'drive'
    }, (err, res) => {
        if (err) {
            console.error(`Error getting directory ${folder}: `, err);
            if (responseCallback) { responseCallback({ isSuccess: false }); }
            return;
        }
        else if (!res || res.data.files.length < 1) {
            console.warn(`Directory ${folder} not found!`);
            if (responseCallback) { responseCallback({ isSuccess: false }); }
            return;
        }

        //console.log(res.data.files);
        if (callback) {
            callback(res.data.files[0], responseCallback);
        }
    });
}

function listFiles(folder, driveClient, callback, responseCallback) {
    driveClient.files.list({
        q: "'" + folder.id + "' in parents and (mimeType contains 'image/' or mimeType = 'application/pdf')",
        fields: 'files(id, name)',
        spaces: 'drive',
        orderBy: 'createdTime desc'
    }, (err, res) => {
        if (err || !res || res.data.files.length < 1) {
            console.log(err);
            if (responseCallback) { responseCallback({ isSuccess: false }); }
            return;
        }
        //console.log('Files from Drive: ', res.data.files);
        if (callback) { callback(res.data.files); }
    });
    return;
}

async function saveFile(filePath, filename, responseCallback) {
    uploadFile(filePath, filename, DRIVE_FOLDER, responseCallback); 
}

async function uploadFile(filePath, filename, folder, responseCallback) {
    const client = await authClient.authorize();
    if (client) {
        console.log('Saving file ' + filename + ' to Drive...');
        const driveClient = google.drive({ version: DRIVE_API_VERSION, auth: client });
        getFolder(driveClient, folder,
            (f) => {
                var fileMetadata = {
                    'name': filename.replace(FOLDER_EXTENSION, ''),
                    parents: [f.id]
                };
                var media = null;
                var mimeType = getMimeType(filename);
                if (filePath) {
                    media = {
                        body: fs.createReadStream(filePath + filename)
                    };
                    if (mimeType) { media.mimeType = mimeType }
                }
                else {
                    fileMetadata.mimeType = mimeType;
                }
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
                    //console.log('File id: ', res.data.id);
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
        switch (fileType[1]) {
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
            case 'folder':
                result = 'application/vnd.google-apps.folder';
                break;
            default:
                break;
        }
    }
    return result;
}

async function getFile(filename, mimeType, isBinary, callback, responseCallback) {
    getRemoteFile(DRIVE_FOLDER, filename, mimeType, isBinary, callback, responseCallback);
}

async function getRemoteFile(folder, filename, mimeType, isBinary, callback, responseCallback) {
    const client = await authClient.authorize();
    if (client) {
        console.log('Getting file ' + folder + '/' + filename + ' from Drive...');
        var options = { version: DRIVE_API_VERSION, auth: client };
        const driveClient = google.drive(options);
        getFolder(driveClient, folder,
            (f) => {
                driveClient.files.list({
                    q: "'" + f.id + "' in parents and mimeType='" + mimeType + "' and name = '" + filename + "'",
                    fields: 'files(id, name)',
                    spaces: 'drive',
                    orderBy: 'createdTime desc'
                }, (err, res) => {
                    if (err) {
                        console.log(err);
                        if (responseCallback) { responseCallback({ isSuccess: false }); }
                        return;
                    }
                    //console.log('Files: ', res.data.files);

                    if (res.data.files && res.data.files.length > 0) {
                        var fileId = res.data.files[0].id;
                        getFileById(driveClient, fileId, isBinary, callback, responseCallback);
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
        console.warn('Failed to get file from Drive, client not set correctly!');
        if (responseCallback) { responseCallback({ isSuccess: false, error: 'Failed to restore file ' + filename + '!' }); }
    }
}

async function getBinaryFileById(driveClient, filename, fileId, callback, responseCallback) {
    const res = await driveClient.files.get(
        { fileId: fileId, alt: 'media' },
        { responseType: 'stream' }
    );

    const dest = fs.createWriteStream(STORAGE_FOLDER + filename);

    // var obj = {};
    //         Object.assign(obj, res);
    //         delete obj.data;
    //         console.log('Response: ', obj);

    res.data
        .on('end', () => {
            console.log('Done downloading file: ', filename);
            if (callback && callback(res.data, responseCallback)) { return; }
            if (responseCallback) { responseCallback({ isSuccess: true }); }
            return;
        })
        .on('error', err => {
            console.error('Error downloading file: ', filename);
            if (responseCallback) { responseCallback({ isSuccess: false }); }
        })
        // .on('data', d => {
        //     progress += d.length;
        //     process.stdout.clearLine();
        //     process.stdout.cursorTo(0);
        //     process.stdout.write(`Downloaded ${progress} bytes`);
        // })
        .pipe(dest);
}

function getFileById(driveClient, fileId, isBinary, callback, responseCallback) {
    driveClient.files.get({
        fileId: fileId,
        alt: 'media'
    }, isBinary ? {
        responseType: 'arraybuffer' //,encoding: null 
    } : {
                //empty
            }, (err, res) => {
                if (err) {
                    console.log(err);
                    if (responseCallback) { responseCallback({ isSuccess: false }); }
                    return;
                }

                console.log('FileId successfully returned: ', fileId);
                try {
                    // var obj = {};
                    // Object.assign(obj, res);
                    // delete obj.data;
                    // console.log('Response: ', obj);
                    if (callback && callback(res.data, responseCallback)) { return; }
                    if (responseCallback) { responseCallback({ isSuccess: true }); }
                    return;
                }
                catch (err) {
                    console.log(err);
                    if (responseCallback) { responseCallback({ isSuccess: false }); }
                    return;
                }
            });
}

function saveAsBinary(doc, filename) {
    saveLocalRawData(filename, doc);

    //console.log('Binary len:', byteCharacters.length);
    //saveLocalBinaryFile('binary_' + filename, doc);

    //saveLocalEncodedFile('encoded_' + filename, doc);

    //saveLocalBinaryFile(filename, doc)

    //saveLocalBinaryEncodedFile('binary_encoded_' + filename, doc);

    return filename;
}

function saveLocalBinaryEncodedFile(filename, data) {
    var byteCharacters = str2ab(atob(data));
    console.log('Saving file ' + filename + ' with encoded binary [length=' + byteCharacters.length + ']...');
    fs.writeFile(STORAGE_FOLDER + filename, byteCharacters, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}

function saveLocalBinaryFile(filename, data) {
    var byteCharacters = atob(data);
    console.log('Saving file ' + filename + ' with binary conversion [length=' + byteCharacters.length + ']...');
    fs.writeFile(STORAGE_FOLDER + filename, byteCharacters, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}

function saveLocalEncodedFile(filename, data) {
    var byteCharacters = str2ab(data);
    console.log('Saving file ' + filename + ' with encoded data [length=' + byteCharacters.length + ']...');
    fs.writeFile(STORAGE_FOLDER + filename, byteCharacters, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}

function saveLocalRawData(filename, data) {
    console.log('Saving file ' + filename + ' with raw data [length=' + data.length + ']...');
    fs.writeFile(STORAGE_FOLDER + filename, data, function (err) {
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

module.exports = {
    saveData,
    restoreData,
    saveUsers,
    restoreUsers,
    saveDocuments,
    restoreDocuments,
    getFile,
    getRemoteFile,
    saveFile,
    uploadFile,
    getMimeType,
    FOLDER_EXTENSION,
    STORAGE_FOLDER
}

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

function saveData() {
    return uploadFile(DATA_FOLDER, DB_FILE);
}

async function restoreData() {
    const data = await getFile(DB_FILE, 'application/json', false);
    return storage.restoreDb(data);
}

function saveUsers() {
    return uploadFile(DATA_FOLDER, USERS_FILE);
}

async function restoreUsers() {
    const data = await getFile(USERS_FILE, 'application/json', false);
    return storage.restoreUsers(data);
}

function saveDocuments() {
    const files = fs.readdirSync(STORAGE_FOLDER);
    for (let i = 0; i < files.length; i++) {
        const filename = files[i];
        if (filename === '.' || filename === '..') { continue; }
        uploadFile(STORAGE_FOLDER, filename);
    }
}

async function getFolder(driveClient, folders, parentId) {
    if (Array.isArray(folders)) {
        var currentFolder = folders.shift();
        var query = "mimeType = 'application/vnd.google-apps.folder' and name = '" + currentFolder + "'";
        if(parentId) {
            query = "'" + parentId + "' in parents and " + query;
        }
        var result = await driveClient.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive',
            pageSize: 1
        }).catch(err => {
            console.error(`Error getting directory ${currentFolder}: `, err);
            throw err;
        });
        
        //console.log('GetFolder result: ', result);
        if (!result || result.data.files.length < 1) {
            console.warn(`Directory ${currentFolder} not found!`);
            return null;
        }
        if (folders.length > 0) {
            return await getFolder(driveClient, folders, result.data.files[0].id);
        }
        else {
            console.log(result.data.files);
            return result.data.files[0];
        }
    }
    else {
        return getFolder(driveClient, [ folders ]);
    }
}

// async function listFiles(folder, driveClient) {
//     var res = await driveClient.files.list({
//         q: "'" + folder.id + "' in parents and (mimeType contains 'image/' or mimeType = 'application/pdf')",
//         fields: 'files(id, name)',
//         spaces: 'drive',
//         orderBy: 'createdTime desc',
//         pageSize: 1
//     });
//     if (!res || res.data.files.length < 1) {
//         console.log(`No files found in folder ${folder}`);
//         return { isSuccess: false };
//     }
//     console.log('Files from Drive: ', res.data.files);
//     return res.data.files; 
// }

async function uploadFile(filePath, filename, folder) {
    try {
        var folders = [ DRIVE_FOLDER ];
        if (folder) { folders.push(folder); }
        const client = await authClient.authorize();
        console.log('Saving file ' + filename + ' to Drive...');
        const driveClient = google.drive({ version: DRIVE_API_VERSION, auth: client });
        var f = await getFolder(driveClient, folders);
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
            if (mimeType) {
                media.mimeType = mimeType;
            }
        }
        else {
            fileMetadata.mimeType = mimeType;
        }
        var res = await driveClient.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id'
        });
        //console.log('Create folder result: ', res);
        console.log('File id: ', res.data.id);
        return true;
    }
    catch (err) {
        console.err('Failed to save file ' + filename + '!', err);
        return false;
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

function getFile(filename, mimeType, isBinary) {
    return getRemoteFile(DRIVE_FOLDER, filename, mimeType, isBinary);
}

async function getRemoteFile(folder, filename, mimeType, isBinary) {
    try {
    const client = await authClient.authorize();
        console.log('Getting file ' + folder + '/' + filename + ' from Drive...');
        var options = { version: DRIVE_API_VERSION, auth: client };
        const driveClient = google.drive(options);
        var f = await getFolder(driveClient, [ folder ]);
        var res = await driveClient.files.list({
            q: "'" + f.id + "' in parents and mimeType='" + mimeType + "' and name = '" + filename + "'",
            fields: 'files(id, name)',
            spaces: 'drive',
            orderBy: 'createdTime desc',
            pageSize: 1
        });
        //console.log('GetRemoteFile res: ', res);
        if (res && res.data && res.data.files && res.data.files.length > 0) {
            console.log('Files: ', res.data.files);
            var fileId = res.data.files[0].id;
            await getFileById(driveClient, fileId, isBinary);
            return { isSuccess: true };
        }
        else {
            console.log('No file found to restore!');
            return { isSuccess: false, error: 'No file found to restore!' };
        }
    }
    catch(err) {
        console.error('Failed to restore file ' + filename, err);
        return { isSuccess: false, error: 'Failed to restore file ' + filename };
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

async function getFileById(driveClient, fileId, isBinary) {
    var res = await driveClient.files.get({
        fileId: fileId,
        alt: 'media'
    }, isBinary ? {
        responseType: 'arraybuffer' //,encoding: null 
    } : { });
    console.log('FileId successfully returned: ', fileId);
    return fileId;
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
    /* restoreDocuments, */
    getFile,
    getRemoteFile,
    uploadFile,
    getMimeType,
    FOLDER_EXTENSION
}

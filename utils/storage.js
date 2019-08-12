//const atob = require('atob');
const btoa = require('btoa');
const fs = require('fs');
const googleApi = require('../authentication/googleApi');

const STORAGE_FOLDER = './data/storage/';
const FILE_REGEX = /^data:(.+)\/(.+);base64,/;

function getFileExtension(doc) {
    const fileType = doc.match(FILE_REGEX);
    return fileType && fileType.length > 2 ? '.' + fileType[2] : '';
}

function existsLocalFile(photoPath) {
    return fs.existsSync(photoPath);
}

function getFileContent(photoPath) {
    return btoa(fs.readFileSync(photoPath));
}

function saveBuffer(filename, content) {
    var buf = Buffer.from(content.replace(FILE_REGEX, ''), 'base64');
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

function getFolderName(season, teamId, stepId) {
    return [season, teamId, stepId].join('_');
}

function getFilename(season, teamId, stepId, playerId, extension, extra) {
    return [season, teamId, stepId, playerId, extra ? extra : '' + fileExtension].join('_');
}

function getPhoto(season, teamId, stepId, filename) {
    var folder = getFolderName(season, teamId, stepId);
    var photoPath = STORAGE_FOLDER + filename;
    const mimeType = googleApi.getMimeType(filename);

    let result = { src: null, existsLocally: existsLocalFile(photoPath) };
    if (result.existsLocally) {
        result.src = "data:" + mimeType + ";base64," + getFileContent(photoPath);
    }
    else {
        console.warn('Missing file: ', filename);
        //TODO Remove when saving data handled properly
        console.log('Restoring photo ' + folder + '/'+ filename +'...');

        saveRawFile(filename, googleApi.getRemoteFile(folder, filename, mimeType, true));
        result.src = '/show_loader.gif';
    }
    //console.log('Photo: ' + photo.length);
    return result;
}

function saveFile(content, season, teamId, stepId, playerId, extra) {
    const fileExtension = getFileExtension(content);
    const folder = getFolderName(season, teamId, stepId);
    const filename = getFilename(season, teamId, stepId, playerId, fileExtension, extra);
    saveBuffer(filename, content);
    
    //saveStream(filename, content);

    googleApi.uploadFile(STORAGE_FOLDER, filename, folder);
    return filename;
}

module.exports = {
    existsLocalFile,
    getFileExtension,
    getFileContent,
    saveRawFile,
    saveBuffer,
    getFolderName,
    getFilename,
    getPhoto,
    saveFile
}
const fs = require('fs');
const { google } = require('googleapis');
const oAuth2 = require('./oAuth2');

const DATA_PATH = './data/db.json';

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

function saveData(responseCallback) {
    const oAuth2Client = oAuth2.authorize();
    if (oAuth2Client) {
        const driveClient = google.drive({ version: 'v3', auth: oAuth2Client });
        const folder = getAppFolder(driveClient,
            (folder) => {
                var fileMetadata = {
                    'name': 'data.json',
                    parents: [folder.id]
                };
                var media = {
                    mimeType: 'application/json',
                    body: fs.createReadStream(DATA_PATH)
                };
                driveClient.files.create({
                    resource: fileMetadata,
                    media: media,
                    fields: 'id'
                }, (err, res) => {
                    console.log(res.id);
                    console.log(res.data.id);
                    responseCallback({ isSuccess: true });
                });
            },
            responseCallback);
    }
    else {
        responseCallback({ isSuccess: false, error: 'Failed to save data!' });
    }
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
    const drive = google.drive({ version: 'v3', auth });
    drive.files.list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name)',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const files = res.data.files;
        if (files.length) {
            console.log('Files:');
            files.map((file) => {
                console.log(`${file.name} (${file.id})`);
            });
        } else {
            console.log('No files found.');
        }
    });
}

module.exports = {
    saveData
}

const fs = require('fs');
const { google } = require('googleapis');

const SECRET_PATH = './data/client_secret.json';
const TOKEN_PATH = './data/credentials.json';
// If modifying these scopes, delete credentials.json.
const SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.metadata',
];

function isDriveAuthEnabled() {
    if (!fs.existsSync(SECRET_PATH)) {
        return { success: false, nextStep: 'secret' }
    }
    if (!fs.existsSync(TOKEN_PATH)) {
        const url = getAccessToken(getOAuth2Client(getOAuth2Credentials()));
        return { success: false, nextStep: 'token', url: url }
    }
    return { success: true };
}

function saveClientSecret(file) {
    console.log('Saving file ' + SECRET_PATH)
    fs.writeFile(SECRET_PATH, file, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, responseCallback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    //console.log('Authorize this app by visiting this url: ', authUrl)
    if (responseCallback) {
        responseCallback({ isAuthorized: false, url: authUrl });
    }
    return authUrl;
}

function setAccessToken(code, responseCallback) {
    const oAuth2Client = getOAuth2Client(getOAuth2Credentials());
    if (oAuth2Client) {
        oAuth2Client.getToken(code, (err, token) => {
            if (err) {
                console.log(err);
                if (responseCallback) {
                    responseCallback({ isAuthorized: false, error: err });
                }
                return err;
            }
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) {
                    console.error(err);
                    if (responseCallback) {
                        responseCallback({ isAuthorized: false, error: err });
                    }
                    return err;
                }
                console.log('Token stored to', TOKEN_PATH);
                if (responseCallback) {
                    responseCallback({ isAuthorized: true });
                }
                return true;
            });
        });
    }
    else {
        if (responseCallback) {
            responseCallback({ isAuthorized: false, error: 'Failed to get authentication token!' });
        }
        return false;
    }
}

function resetAuth(responseCallback) {
    let result = null;
    try {
        fs.unlinkSync(TOKEN_PATH);
        console.log('File ' + TOKEN_PATH + ' deleted.');
        fs.unlinkSync(SECRET_PATH);
        console.log('File ' + SECRET_PATH + ' deleted.');
    }
    catch (err) {
        console.log(err);
        result = err;
    }
    if (responseCallback) {
        return result === null ? responseCallback({}) : responseCallback({ error: err });
    }
}

function getOAuth2Credentials() {
    try {
        const content = fs.readFileSync(SECRET_PATH);
        return JSON.parse(content);
    }
    catch (err) {
        console.log('Error getting OAuth2 credentials:', err);
        return null;
    }
}

function getOAuth2Client(credentials) {
    try {
        if (!credentials) {
            return null;
        }
        const { client_secret, client_id, redirect_uris } = credentials.installed;

        return new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);
    }
    catch (err) {
        console.log('Error getting OAuth2 client:', err);
        return null;
    }
}

function authorize(oAuth2Client = null) {
    try {
        // Check if we have previously stored a token.
        const token = fs.readFileSync(TOKEN_PATH);
        if (!oAuth2Client) {
            oAuth2Client = getOAuth2Client(getOAuth2Credentials());
        }
        oAuth2Client.setCredentials(JSON.parse(token));
        return oAuth2Client;
    }
    catch (err) {
        console.log(err);
        return null;
    }
}

module.exports = {
    isDriveAuthEnabled,
    getAccessToken,
    getOAuth2Credentials,
    getOAuth2Client,
    resetAuth,
    saveClientSecret,
    setAccessToken,
    authorize
}
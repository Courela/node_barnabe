const { google } = require('googleapis');
const SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.metadata',
];
const DATA_FOLDER = './data/';

async function authorize() {
    var keysEnvVar= {};
    if (process.env.NODE_ENV === 'production') {
        keysEnvVar = process.env['CREDS'];
        if (!keysEnvVar) {
            throw new Error('The $CREDS environment variable was not found!');
        }
    }
    else {
        const fs = require('fs');
        if (fs.existsSync(DATA_FOLDER + 'tacabarnabe-1533670876618-cc2fe43f4084.json')) {
            keysEnvVar = fs.readFileSync(DATA_FOLDER + 'tacabarnabe-1533670876618-cc2fe43f4084.json');
        } else {
            console.error('No such file: ', DATA_FOLDER + 'tacabarnabe-1533670876618-cc2fe43f4084.json');
            return null;
        }
    }
    const keys = JSON.parse(keysEnvVar);
    //console.log(keys);
    const jwt = new google.auth.JWT(
        keys.client_email,
        null,
        keys.private_key,
        SCOPES
    );
    try {
        const res = await jwt.authorize();
        //console.log('JWT res: ', res);
        // const driveClient = google.drive({ version: 'v3', auth: jwt });
        // list(driveClient);
    }
    catch(err) {
        console.error(err);
        return null;
    }
    return jwt;
}

// function list(driveClient) {
//     driveClient.files.list({
//         spaces: 'drive'
//     }, (err, res) => {
//         if (err) {
//             console.error(`Error listing: `, err);
//             return;
//         }
//         else if (!res || res.data.files.length < 1) {
//             console.warn(`Nothing found: `, res);
//             return;
//         }

//         console.log(res.data.files);
//     });
// }

module.exports = {
    authorize
}

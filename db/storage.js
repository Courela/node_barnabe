const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const STORAGE_FOLDER = './data/storage/';

const dbAdapter = new FileSync('./data/db.json');
const db = low(dbAdapter);

const usersAdapter = new FileSync('./data/users.json');
const users = low(usersAdapter);

function init() {
    var fs = require('fs');
    if (!fs.existsSync(STORAGE_FOLDER)) {
        fs.mkdir(STORAGE_FOLDER, (err) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log('Storage folder created: ', STORAGE_FOLDER);
        })
    }

    if (!db.has('Season').value()) {
        // Set some defaults (required if your JSON file is empty)
        db.defaults({
            Step: [
                { Id: 1, Description: 'Escalão I', Gender: null, IsCaretakerRequired: true },
                { Id: 2, Description: 'Escalão II', Gender: 'M', IsCaretakerRequired: true },
                { Id: 3, Description: 'Escalão III', Gender: 'M', IsCaretakerRequired: false },
                { Id: 4, Description: 'Escolinhas', Gender: null, IsCaretakerRequired: true },
                { Id: 5, Description: 'Feminino', Gender: 'F', IsCaretakerRequired: false }
            ],
            Role: [
                { Id: 1, Description: 'Jogador' },
                { Id: 2, Description: 'Treinador' },
                { Id: 3, Description: 'Treinador Adjunto' },
                { Id: 4, Description: 'Delegado' },
                { Id: 5, Description: 'Sub-Delegado' },
                { Id: 6, Description: 'Equipa Médica' }
            ],
            Team: [
                { Id: 1, Name: 'União Desportiva e Recreativa Sabuguense', ShortDescription: 'Sabugo' },
                { Id: 2, Name: 'Sociedade Recreativa e Desportiva Aruilense', ShortDescription: 'Aruil' },
                { Id: 3, Name: 'Sociedade Recreativa "Os Bem Entendidos de Albogas”', ShortDescription: 'Albogas' },
                { Id: 4, Name: 'Grupo Desportivo e Recreativo "Os Lobinhos"', ShortDescription: 'Vale de Lobos' },
                { Id: 5, Name: 'Sociedade Recreativa e Desportiva de Negrais', ShortDescription: 'Negrais' },
                { Id: 6, Name: 'Centro de Recreio Popular e Cultural Musical Dona Maria', ShortDescription: 'Saloios D. Maria' },
                { Id: 7, Name: 'Rancho Folclórico "Os Camponeses de Dona Maria”', ShortDescription: 'Camponeses' },
                { Id: 8, Name: 'Grupo Desportivo Almargense', ShortDescription: 'Almargense' },
                { Id: 9, Name: 'Clube Recreativo Almornense', ShortDescription: 'Almornos' },
                { Id: 10, Name: 'Liga dos Amigos de Covas de Ferro', ShortDescription: 'Covas de Ferro' },
                { Id: 11, Name: 'Grupo Recreativo e Desportivo de Camarões', ShortDescription: 'Camarões' },
                { Id: 99, Name: 'Test Team', ShortDescription: 'Test Team' }
            ],
            Season: [
                { Year: 2017, IsActive: false },
                { Year: 2018, IsActive: true }
            ],
            BirthStepLimit: [
                {
                    Season: 2017,
                    StepId: 1,
                    MinDate: "2005-11-25T00:00:00.000Z",
                    MaxDate: "2009-11-24T00:00:00.000Z"
                },
                {
                    Season: 2017,
                    StepId: 2,
                    MinDate: "2000-11-25T00:00:00.000Z",
                    MaxDate: "2005-11-24T00:00:00.000Z"
                },
                {
                    Season: 2017,
                    StepId: 3,
                    MinDate: "1900-01-01T00:00:00.000Z",
                    MaxDate: "2000-11-24T00:00:00.000Z"
                },
                {
                    Season: 2017,
                    StepId: 4,
                    MinDate: "2009-11-25T00:00:00.000Z",
                    MaxDate: "2013-12-31T00:00:00.000Z"
                },
                {
                    Season: 2017,
                    StepId: 5,
                    MinDate: "1900-01-01T00:00:00.000Z",
                    MaxDate: "2005-11-24T00:00:00.000Z"
                },
                {
                    Season: 2018,
                    StepId: 1,
                    MinDate: "2005-11-22T00:00:00.000Z",
                    MaxDate: "2009-11-21T00:00:00.000Z"
                },
                {
                    Season: 2018,
                    StepId: 2,
                    MinDate: "2000-11-22T00:00:00.000Z",
                    MaxDate: "2005-11-21T00:00:00.000Z"
                },
                {
                    Season: 2018,
                    StepId: 3,
                    MinDate: "1900-01-01T00:00:00.000Z",
                    MaxDate: "2000-11-21T00:00:00.000Z"
                },
                {
                    Season: 2018,
                    StepId: 4,
                    MinDate: "2009-11-22T00:00:00.000Z",
                    MaxDate: "2013-12-31T00:00:00.000Z"
                },
                {
                    Season: 2018,
                    StepId: 5,
                    MinDate: "1900-01-01T00:00:00.000Z",
                    MaxDate: "2005-11-21T00:00:00.000Z"
                }
            ],
            TeamStep: [],
            Person: [],
            Player: []
        }).write();
    }

    if (!users.has('User').value()) {
        users.defaults({
            User: [
                { Id: 1, Username: 'Admin', Password: 'Barnabe2018', TeamId: null, CreatedAt: new Date() },
                { Id: 2, Username: 'TestUser', Password: 'TestPass', TeamId: 99, CreatedAt: new Date() },
                { Id: 11, Username: 'Negrais', Password: 'Srdn#1973', TeamId: 5, CreatedAt: new Date("2018-07-27T16:15:00.000Z") },
                { Id: 12, Username: 'Saloios Dª Maria', Password: '141035', TeamId: 6, CreatedAt: new Date("2018-07-27T16:15:00.000Z") }
            ]
        }).write();
    }

    return db.getState();
}

function restoreDb(data) {
    db.setState(data)
        .write();
}

function restoreUsers(data) {
    users.setState(data)
        .write();
}

function getSingle(entity, value) {
    try {
        const result = db.get(entity)
            .cloneDeep()
            .find({ Id: value })
            .value();

        return result;
    } catch (err) {
        handleError(err);
    }
}

function handleError(err) {
    console.error('Storage: ' + err);
    throw "Unexpected error!";
}

function getMultiple(entity, page = 0, pageSize = SQL_MAX_INT) {
    try {
        const results = db.get(entity)
            .cloneDeep()
            //.slice(page * pageSize, Math.min())
            .value();
        return results;
    } catch (err) {
        handleError(err);
    }
}

function statementQuery(query) {
    return query(db);
}

function usersStatementQuery(query) {
    return query(users);
}

module.exports = {
    init,
    getSingle,
    getMultiple,
    statementQuery,
    usersStatementQuery,
    restoreDb,
    restoreUsers
}
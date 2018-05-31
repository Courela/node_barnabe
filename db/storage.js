const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const dbAdapter = new FileSync('./data/db.json');
const db = low(dbAdapter);

const usersAdapter = new FileSync('./data/users.json');
const users = low(usersAdapter);

function init() {
    if (!db.has('Step').value()) {
        // Set some defaults (required if your JSON file is empty)
        db.defaults({
            Step: [
                { Id: 1, Description: 'Escalão I', Gender: null },
                { Id: 2, Description: 'Escalão II', Gender: 'M' },
                { Id: 3, Description: 'Escalão III', Gender: 'M' },
                { Id: 4, Description: 'Escolinhas', Gender: null },
                { Id: 5, Description: 'Feminino', Gender: 'F' }
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
                { Id: 11, Name: 'Grupo Recreativo e Desportivo de Camarões', ShortDescription: 'Camarões' }
            ],
            Person: [],
            Player: [],
            TeamStep: []
        }).write();
    }

    if (!users.has('User').value()) {
        users.defaults({
            User: [
                { Id: 1, Username: 'Aruil', Password: 'Aruil', TeamId: 2 }
            ]
        }).write();
    }

    return db.getState();
}

function getSingle(entity, value) {
    try {
        const result = db.get(entity)
            .find({ Id: value})
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
    usersStatementQuery
}
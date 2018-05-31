const db = require('../db/adapter');
const storage = require('../db/storage');

function getTeamSteps(season, teamId, invert = false) {
    const query = function (db) {
        //console.log(db.get('TeamStep').value());
        const teamSteps = db.get('TeamStep')
            .filter({ TeamId: teamId, Season: season })
            .value();
        // console.log('Team steps for ' + season + ' [' + teamId + ']:');
        // console.log(teamSteps);
        if (!teamSteps) { teamSteps = [] };
        let result = [];
        if (!invert) {
            result = db.get('Step')
                .intersectionWith(teamSteps, (obj1, obj2) => obj1.Id === obj2.StepId)
                .value();
        }
        else {
            //TODO Not working
            result = db.get('Step')
                .differenceWith(teamSteps, (obj1, obj2) => false)
                .value();
        }
        result.forEach(s => { s.StepId = s.Id; s.TeamId = teamId; s.Season = season });
        console.log(result);
        return result;
    };
    return new Promise((resolve, reject) => {
        try {
            const result = storage.statementQuery(query);
            resolve({ recordset: result });
        }
        catch (err) {
            reject(err);
        }
    });
}

function addStep(season, teamId, stepId) {
    const query = function (db) {
        const exists = db.get('TeamStep')
            .find({ TeamId: teamId, StepId: stepId, Season: season })
            .value();
        if (exists) { return 0; };

        const last = db.get('TeamStep').last().value();
        const id = last && last.Id ? last.Id + 1 : 1;

        db.get('TeamStep')
            .push({ Id: id, TeamId: teamId, StepId: stepId, Season: season })
            .write();
        return 1;
    };
    return new Promise((resolve, reject) => {
        try {
            const result = storage.statementQuery(query);
            resolve({ rowsAffected: result });
        }
        catch (err) {
            reject(err);
        }
    });
}


function getTeams() {
    return db.getMultiple('Team');
}

function getTeamsBySeason(season) {
    const query = ' SELECT DISTINCT t.* FROM Team t ' +
        '   INNER JOIN TeamStep ts ON ts.TeamId = t.Id AND ts.season = @season ;';
    const parameters = [{
        name: 'season',
        type: db.sql_int,
        value: season
    }];
    return db.statementQuery(query, parameters);
}

// function getTeamSteps(season, teamId, invert = false) {
//     const query = ' SELECT s.Id, s.Description, s.Gender, s.IsCaretakerRequired ' +
//         '   ,ts.TeamId, ts.StepId, ts.Season ' + 
//         ' FROM Step s ' +
//         '   LEFT JOIN TeamStep ts ON ts.StepId = s.Id AND ts.TeamId = @teamId AND ts.Season = @season ' +
//         ' WHERE ' + (invert ? ' ts.Id IS NULL ' : 'ts.Id IS NOT NULL; ');
//     const parameters = [{
//         name: 'teamId',
//         type: db.sql_int,
//         value: teamId
//     },{
//         name: 'season',
//         type: db.sql_smallint,
//         value: season
//     }];
//     return db.statementQuery(query, parameters);
// }

function getStep(stepId) {
    return db.getSingle('Step', stepId);
}

// function addStep(season, teamId, stepId) {
//     const query = ' INSERT INTO dbo.TeamStep (TeamId, StepId, Season) ' +
//         ' VALUES (@teamId, @stepId, @season); ';
//         const parameters = [{
//             name: 'teamId',
//             type: db.sql_int,
//             value: teamId
//         },{
//             name: 'stepId',
//             type: db.sql_smallint,
//             value: stepId
//         },{
//             name: 'season',
//             type: db.sql_int,
//             value: season
//         }];
//         return db.statementQuery(query, parameters);
// }

module.exports = {
    addStep,
    getStep,
    getTeams,
    getTeamsBySeason,
    getTeamSteps
}

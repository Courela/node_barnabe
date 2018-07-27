const storage = require('../db/storage');

function getTeamSteps(season, teamId, invert = false) {
    const query = function (db) {
        //console.log(db.get('TeamStep').value());
        const teamSteps = db.get('TeamStep')
            .cloneDeep()
            .filter({ TeamId: teamId, Season: season })
            .value();
        console.log('Team steps for ' + season + ' [' + teamId + ']: ', teamSteps);
        if (!teamSteps) { teamSteps = [] };
        let result = [];
        if (!invert) {
            result = db.get('Step')
                .cloneDeep()
                .intersectionWith(teamSteps, (obj1, obj2) => obj1.Id === obj2.StepId)
                .value();
        }
        else {
            //TODO Not working
            result = db.get('Step')
                .cloneDeep()
                .differenceWith(teamSteps, (obj1, obj2) => false)
                .value();
        }
        result.forEach(s => { s.StepId = s.Id; s.TeamId = teamId; s.Season = season });
        console.log('Team Steps: ', result);
        return result;
    };
    return new Promise((resolve, reject) => {
        try {
            const result = storage.statementQuery(query);
            resolve({ recordset: result, rowsAffected: [result.length] });
        }
        catch (err) {
            reject(err);
        }
    });
}

function addStep(season, teamId, stepId) {
    const query = function (db) {
        const exists = db.get('TeamStep')
            .cloneDeep()
            .find({ TeamId: teamId, StepId: stepId, Season: season })
            .value();
        if (exists) { return 0; };

        const last = db.get('TeamStep').cloneDeep().last().value();
        const id = last && last.Id ? last.Id + 1 : 1;

        db.get('TeamStep')
            .push({ 
                Id: id, 
                TeamId: teamId, 
                StepId: stepId, 
                Season: season,
                CreatedAt: new Date()
            })
            .write();
        return 1;
    };
    return new Promise((resolve, reject) => {
        try {
            const result = storage.statementQuery(query);
            resolve({ rowsAffected: [result] });
        }
        catch (err) {
            reject(err);
        }
    });
}

function deleteStep(season, teamId, stepId) {
    const query = function (db) {
        db.get('TeamStep')
            .remove({ TeamId: teamId, StepId: stepId, Season: season })
            .write();
        return 1;
    };
    return new Promise((resolve, reject) => {
        try {
            const result = storage.statementQuery(query);
            resolve({ rowsAffected: [result] });
        }
        catch (err) {
            reject(err);
        }
    });
}

function getTeams() {
    const query = function (db) {
        return db.get('Team')
            .cloneDeep()
            .value();
    };
    return new Promise((resolve, reject) => {
        try {
            const result = storage.statementQuery(query);
            resolve({ recordset: result, rowsAffected: result.length });
        }
        catch (err) {
            reject(err);
        }
    });
}

function getStep(stepId, season = null) {
    const query = function (db) {
        let step = db.get('Step')
            .cloneDeep()
            .find({ Id: stepId })
            .value();
        
        if (season) {
            const birthStepLimit = db.get('BirthStepLimit')
                .cloneDeep()
                .find({ Season: season, StepId: stepId })
                .value();

            if (birthStepLimit) {
                step = Object.assign(step, birthStepLimit);
            }
        }
        return step;
    };
    return new Promise((resolve, reject) => {
        try {
            const result = storage.statementQuery(query);
            resolve({ recordset: [result], rowsAffected: [1] });
        }
        catch (err) {
            reject(err);
        }
    });
}

function getTeamsBySeason(season) {
    const query = function (db) {
        const stepsBySeason = db.get('TeamStep')
            .cloneDeep()
            .filter({ Season: season })
            .value();

        if (!stepsBySeason) { stepsBySeason = [] };
        let result = [];
        result = db.get('Team')
                .cloneDeep()
                .intersectionWith(stepsBySeason, (obj1, obj2) => obj1.Id === obj2.TeamStepId)
                .value();
        result.forEach(t => { t.TeamId = t.Id; t.Season = season });
        console.log('Teams by season: ', result);
        return result;
    };
    return new Promise((resolve, reject) => {
        try {
            const result = storage.statementQuery(query);
            resolve({ recordset: result, rowsAffected: result.length });
        }
        catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    addStep,
    getStep,
    getTeams,
    getTeamsBySeason,
    getTeamSteps,
    deleteStep
}

const db = require('../db/adapter');

function getPlayers(season, teamId, stepId) {
    const query = ' SELECT plr.Id, prs.[Name],prs.Gender,prs.Birthdate,prs.IdCardNr,prs.IdCardExpireDate,prs.VoterNr,prs.Phone,prs.Email, r.[Description] FROM dbo.Player plr ' +
	    '   INNER JOIN dbo.Person prs ON prs.Id = plr.PersonId ' +
	    '   INNER JOIN dbo.[Role] r ON r.Id = plr.RoleId ' +
        ' WHERE plr.Season = @season AND plr.TeamId = @teamId AND plr.StepId = @stepId ';
    const parameters = [{
        name: 'season',
        type: db.sql_smallint,
        value: season
    },{
        name: 'teamId',
        type: db.sql_int,
        value: teamId
    },{
        name: 'stepId',
        type: db.sql_int,
        value: stepId
    }];
    return db.statementQuery(query, parameters);
}

function addPlayer(teamId, stepId, season, resident, personId, roleId, caretakerId) {
    const query = ' INSERT INTO dbo.Player ([Season],[Resident],[PersonId],[TeamId],[StepId],[RoleId],[CaretakerId]) ' +
        ' VALUES (@season, @resident, @personId, @teamId, @stepId, @roleId, @caretakerId); ' +
        ' SELECT SCOPE_IDENTITY() AS Id; ' ;
        const parameters = [{
            name: 'teamId',
            type: db.sql_int,
            value: teamId
        },{
            name: 'stepId',
            type: db.sql_smallint,
            value: stepId
        },{
            name: 'season',
            type: db.sql_int,
            value: season
        },{
            name: 'resident',
            type: db.sql_bit,
            value: resident
        },{
            name: 'personId',
            type: db.sql_int,
            value: personId
        },{
            name: 'roleId',
            type: db.sql_int,
            value: roleId
        },{
            name: 'caretakerId',
            type: db.sql_int,
            value: caretakerId
        }];
        return db.statementQuery(query, parameters);
}

module.exports = {
    addPlayer,
    getPlayers
}
const db = require('../db/adapter');

function getPersonByIdCardNr(idCardNr) {
    const query = ' SELECT prs.Id,prs.[Name],prs.Gender,prs.Birthdate,prs.IdCardNr,prs.IdCardExpireDate,prs.VoterNr,prs.Phone,prs.Email ' +
        ' FROM dbo.Person prs ' +
        ' WHERE prs.IdCardNr = @idCardNr ';
    const parameters = [{
        name: 'idCardNr',
        type: db.sql_string,
        value: idCardNr
    }];
    return db.statementQuery(query, parameters);
}

function addPerson(name, gender, birthdate, docId, voterNr, phone, email) {
    console.log('Person to insert: ' + name + gender + birthdate + docId + voterNr + phone + email);
    const query = ' INSERT INTO dbo.Person ([Name],Gender,Birthdate,IdCardNr,IdCardExpireDate,VoterNr,Phone,Email) ' +
        ' VALUES (@name, @gender, @birthdate, @docId, @docIdExpire, @voterNr, @phone, @email); ' +
        ' SELECT Id,[Name],Gender,Birthdate,IdCardNr,IdCardExpireDate,VoterNr,Phone,Email ' +
        ' FROM dbo.Person WHERE Id = SCOPE_IDENTITY(); ';
    const parameters = [{
        name: 'name',
        type: db.sql_string,
        value: name
    },{
        name: 'gender',
        type: db.sql_char,
        value: gender
    },{
        name: 'birthdate',
        type: db.sql_date,
        value: birthdate
    },{
        name: 'docId',
        type: db.sql_string,
        value: docId
    },{
        name: 'docIdExpire',
        type: db.sql_date,
        value: birthdate
    },{
        name: 'voterNr',
        type: db.sql_string,
        value: voterNr
    },{
        name: 'phone',
        type: db.sql_string,
        value: phone
    },{
        name: 'email',
        type: db.sql_string,
        value: email
    }];
    return db.statementQuery(query, parameters);
}

function updatePerson(id, name, gender, birthdate, docId, voterNr, phone, email) {
    console.log('Person to update: ' + id + name + gender + birthdate + docId + voterNr + phone + email);
    const query = ' UPDATE dbo.Person ' + 
        ' SET Name = @name, VoterNr = @voterNr, Phone = phone, Email = @email ' +
        ' WHERE Id = @id;';
    const parameters = [{
        name: 'name',
        type: db.sql_string,
        value: name
    },{
        name: 'voterNr',
        type: db.sql_string,
        value: voterNr
    },{
        name: 'phone',
        type: db.sql_string,
        value: phone
    },{
        name: 'email',
        type: db.sql_string,
        value: email
    },{
        name: 'id',
        type: db.sql_int,
        value: id
    }];
    return db.statementQuery(query, parameters);
}

module.exports = {
    getPersonByIdCardNr,
    addPerson,
    updatePerson
}

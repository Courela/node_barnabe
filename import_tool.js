const fs = require('fs');

function isCaretakerRequired(stepId) {
    return [1,2,4].indexOf(stepId) >= 0;
}

if (process.argv.length > 3) {
    try {
        const result = {
            TeamStep: [],
            Person: [],
            Player: []
        };
        const season = parseInt(process.argv[3]);
        const content = fs.readFileSync(process.argv[2]);
        const json = JSON.parse(content);

        let personId = 1;
        let playerId = 1;
        let teamStepId = 1;

        let duplicatePerson = [];

        //console.log(json[0]);
        json.forEach((p) => {
            let dup = null;

            let person = result.Person.find(pr => pr.IdCardNr === p.IdCardNr);
            if (!person) {
                person = {
                    Id: personId,
                    Name: p.Name,
                    Gender: p.Gender,
                    Birthdate: p.Birthdate,
                    IdCardNr: p.IdCardNr ? p.IdCardNr.toString() : '',
                    IdCardExpireDate: null,
                    VoterNr: p.VoterNr ? p.VoterNr : null,
                    Phone: p.Phone && !isCaretakerRequired(p.StepId) ? p.Phone.toString() : '',
                    Email: p.Email && !isCaretakerRequired(p.StepId) ? p.Email : ''
                };
                result.Person.push(person);
                personId = personId + 1;
            }
            else {
                console.log('Person already exists: ', person);
                dup = { PersonId: person.Id, IdCardNr: person.IdCardNr };
            }

            let caretaker = null;
            if (isCaretakerRequired(p.StepId) && (p.CaretakerVoterNr || p.Email || p.Phone )) {
                caretaker = {
                    Id: personId,
                    Name: '',
                    Gender: null,
                    Birthdate: null,
                    IdCardNr: '',
                    IdCardExpireDate: null,
                    VoterNr: p.CaretakerVoterNr,
                    Phone: p.Phone ? p.Phone.toString() : '',
                    Email: p.Email ? p.Email : ''
                };
                result.Person.push(caretaker);
                personId = personId + 1;
                console.log('Caretaker: ', caretaker.Id);
            }

            let player = result.Player.find(pl => 
                    pl.PersonId === person.PersonId && 
                    pl.RoleId === p.RoleId && 
                    pl.StepId === p.StepId);
            if (!player) {
                player = {
                    Id: playerId,
                    Season: season,
                    TeamId: p.TeamId,
                    StepId: p.StepId,
                    PersonId: person.Id,
                    RoleId: p.RoleId,
                    Resident: p.Resident,
                    CareTakerId: caretaker ? caretaker.Id : null,
                    Comments: p.Comments,
                    PhotoFilename: null,
                    DocFilename: null
                };
                result.Player.push(player);
                playerId = playerId + 1;
            }
            else {
                console.log('Player already exists: ', player);
            }
            if (dup) {
                dup.PlayerId = player.Id;
                dup.TeamId = player.TeamId;
                dup.StepId = player.StepId;

                duplicatePerson.push(dup);
            }
            
            if (!result.TeamStep.find((t) => 
                    t.TeamId === p.TeamId && 
                    t.StepId === p.StepId && 
                    t.Season === p.Season)) {
                const teamStep = {
                    Id: teamStepId,
                    TeamId: p.TeamId,
                    StepId: p.StepId,
                    Season: season
                };
                result.TeamStep.push(teamStep);

                teamStepId = teamStepId + 1;
            }
        });

        fs.writeFileSync('import.json', JSON.stringify(result));

        console.log('Duplicated entries: ', duplicatePerson.length);
        console.log(duplicatePerson);

    } catch(err) {
        console.log(err);
    }
}
else {
    console.log('Missing filename and season!');
}

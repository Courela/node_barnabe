const Json2csvParser = require('json2csv').Parser;
const playersMgr = require('../managers/players');

function formatDate(strDate) {
    var date = new Date(strDate);
    var dd = date.getDate();
    var mm = date.getMonth() + 1; //January is 0!

    var yyyy = date.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    return dd + '/' + mm + '/' + yyyy;
}

function formatGender(gender) {
    var result = '';
    switch(gender) {
        case 'M':
            result = 'Masculino';
            break;
        case 'F':
            result = 'Feminino';
            break;
        default:
            break;
    }
    return result;
}

async function exportPlayers(season, teamId, stepId) {
    return await playersMgr.getPlayers(season, teamId, stepId, [1])
        .then((players) => {
            const fields = [
                'person.Name',
                {
                    value: (row) => formatGender(row['person.Gender'])
                },
                {
                    value: (row) => formatDate(row['person.Birthdate'])
                },
                'person.IdCardNr',
                'person.VoterNr',
                'person.Phone',
                'person.Email'
            ];
            const json2csvParser = new Json2csvParser({ fields, header: false, delimiter: '\t', quote: '', flatten: true });
            const tsv = json2csvParser.parse(players);

            //console.log(tsv);
            return tsv;
        })
        .catch((err) => {
            console.log(err);
            return 'Error';
        });
}

module.exports = {
    exportPlayers
}

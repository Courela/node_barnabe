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
    switch (gender) {
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
            if (players) {
                const fields = [{
                    label: 'Nome',
                    value: 'person.Name'
                },
                {
                    label: 'Genero',
                    value: (row) => formatGender(row['person.Gender'])
                },
                {
                    label: 'Data Nascimento',
                    value: (row) => formatDate(row['person.Birthdate']),
                    default: 'N/A'
                },
                {
                    label: 'CC Jogador',
                    value: 'person.IdCardNr'
                },
                {
                    label: 'Nome Responsavel',
                    value: 'caretaker.Name',
                    default: 'N/A'
                },
                {
                    label: 'CC Responsavel',
                    value: 'caretaker.IdCardNr',
                    default: 'N/A'
                },
                {
                    label: 'Nr Eleitor',
                    //value: 'caretaker.VoterNr',
                    value: (row) => row['caretaker.VoterNr'] ? row['caretaker.VoterNr'] : row['person.VoterNr'],
                    default: 'N/A'
                    //value: (row) => row.caretaker && row.caretaker.VoterNr ? row.caretaker.VoterNr : (row.person.VoterNr ? row.person.VoterNr : 'N/A')
                },
                {
                    label: 'Foto?',
                    value: (row) => row['PhotoFilename'] ? 'Sim' : 'Não',
                    default: 'N/A'
                },
                {
                    label: 'FichaAtleta?',
                    value: (row) => row['DocFilename'] ? 'Sim' : 'Não',
                    default: 'N/A'
                },
                {
                    label: 'Telefone',
                    value: 'caretaker.Phone',
                    default: 'N/A'
                    //value: (row) => row.caretaker && row.caretaker.Phone ? row.caretaker.Phone : (row.person.Phone ? row.person.Phone : 'N/A')
                },
                {
                    label: 'Email',
                    value: 'caretaker.Email',
                    default: 'N/A'
                    //value: (row) => row.caretaker && row.caretaker.Email ? row.caretaker.Email : (row.person.Email ? row.person.Email : 'N/A')
                }
                ];
                //const json2csvParser = new Json2csvParser({ fields, header: true, delimiter: '\t', quote: '', flatten: true });
                const json2csvParser = new Json2csvParser({ fields, header: true, delimiter: ';', quote: '', flatten: true });
                const tsv = json2csvParser.parse(players);

                //console.log(tsv);
                return tsv;
            }
            else return null;
        })
        .catch((err) => {
            console.log(err);
            return 'Error';
        });
}

module.exports = {
    exportPlayers
}

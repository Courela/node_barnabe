const Json2csvParser = require('json2csv').Parser;
const playersMgr = require('../managers/players');

async function exportPlayers(season, teamId, stepId) {
    return await playersMgr.getPlayers(season, teamId, stepId)
        .then((players) => {
            const fields = [
                'Name',
                'Gender',
                'Birthdate',
                'IdCardNr',
                'IdCardExpireDate',
                'VoterNr',
                'Phone',
                'Email'
            ];
            const json2csvParser = new Json2csvParser({fields, header: false, delimiter: '\t', quote: '' });
            const tsv = json2csvParser.parse(players);
            
            console.log(tsv);
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

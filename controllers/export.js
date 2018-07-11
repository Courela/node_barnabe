const exportMgr = require('../managers/export');

function exportPlayers(req, res) {
    let response = '';
    try {
        console.log('Export players: ', req.query);
        const { season, teamId, stepId } = req.query;
        if (season && teamId && stepId) {
            response = exportMgr.exportPlayers(parseInt(season), parseInt(teamId), parseInt(stepId));
            res.attachment('players_' + season + '_' + teamId + '_' + stepId + '.csv');
            res.type('text/csv');
        }
        else {
            res.statusCode = 400;
        }
    }
    catch (err) {
        errors.handleErrors(res);
        response = err;
    }
    res.send(response);
}

module.exports = {
    exportPlayers
}
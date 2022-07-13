const exportMgr = require('../managers/export');

// async function exportSource(req, res) {
//     const { type, season, teamId, stepId } = req.query;
//     res.redirect(`/api/files/export-players?season=${season}&teamId=${teamId}&stepId=${stepId}`);
// }

async function exportSource(req, res) {
    let response = '';
    try {
        const { season, teamId, stepId } = req.query;
        if (season && teamId && stepId) {
            response = await exportMgr.exportPlayers(parseInt(season), parseInt(teamId), parseInt(stepId));
            if (response) {
                response = { data: response };
            }
            else {
                res.statusCode = 404;
            }
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

async function exportPlayers(req, res) {
    let response = '';
    try {
        //console.log('Export players: ', req.query);
        const { season, teamId, stepId } = req.query;
        if (season && teamId && stepId) {
            response = await exportMgr.exportPlayers(parseInt(season), parseInt(teamId), parseInt(stepId));
            if (response) {
                //console.log(response);
                res.attachment('players_' + season + '_' + teamId + '_' + stepId + '.csv');
                res.type('text/csv');
            }
            else {
                res.statusCode = 404;
            }
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
    exportSource,
    exportPlayers
}
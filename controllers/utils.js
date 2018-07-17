const utilsMgr = require('../managers/utils');

async function getRoles (req, res) {
    const result = await utilsMgr.getRoles();
    res.send(result);
}

async function getSeasons (req, res) {
    const result = await utilsMgr.getSeasons();
    res.send(result);
}

module.exports = {
    getRoles,
    getSeasons
}
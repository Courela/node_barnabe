const utilsMgr = require('../managers/utils');

async function getRoles (req, res) {
    const result = await utilsMgr.getRoles();
    res.send(result);
}

async function getSeasons (req, res) {
    const result = await utilsMgr.getSeasons();
    res.send(result);
}

async function getSeason (req, res) {
    const season = parseInt(req.params.season);
    const seasons = await utilsMgr.getSeasons();
    const result = seasons.find(s => s.Year == season);
    console.log('Season: ', result);
    res.send(result);
}

module.exports = {
    getRoles,
    getSeasons,
    getSeason
}
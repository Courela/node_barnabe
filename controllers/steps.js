async function getStandings(req, res) {
    const season = req.query.season;
    const stepId = req.query.stepId;
    const results = [{
        position: 1,
        teamId: 2,
        teamName: 'Aruil',
        points: 10,
        goalsScored: 4,
        goalsConceded: 5,
        avg: -1
    }];
    res.send(results);
}

function addMatch(req, res) {
    const { season, stepId, phase, homeTeamId, awayTeamId, homeTeamGoals, awayTeamGoals } = req.query;
    console.log('Match added: ', req.query);
    res.send();
}

module.exports = {
    getStandings,
    addMatch
}
const usersMgr = require('../managers/users');
const utilsMgr = require('../managers/utils');
const errors = require('../errors');

async function recoverPassword(req, res) {
    utilsMgr.recoverPassword(req.body.email);
    res.send();
}

async function saveDetails(req, res) {
    try {
        const { username } = req.params;
        const { password, email } = req.body;
        if (username && email) {
            await usersMgr.saveDetails(username, password, email);
        } else {
            res.statusCode = 400;
        }
    } catch (err) {
        errors.handleErrors(res, err);
    }
    res.send();
}

module.exports = {
    recoverPassword,
    saveDetails
}
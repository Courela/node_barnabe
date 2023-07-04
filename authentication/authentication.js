const usersMgr = require('../managers/users');
const utilsMgr = require('../managers/utils');

async function authenticateUser(username, password) {
    var hashPassword = await utilsMgr.generatePasswordHash(password);
    console.debug("Hash password for user '"+username+"': ", hashPassword);
    const user = await usersMgr.getUser(username, hashPassword)
    if (user != null) {
        //console.log("authenticateUser: ", user)
        return {
            success: true,
            error: false,
            user: user
        };
    }
    else {
        return {
            success: false,
            error: false,
            user: null
        };
    }
}

module.exports = {
    authenticateUser,
}
const usersMgr = require('../managers/users');

async function authenticateUser(username, password) {
    const user = await usersMgr.getUser(username, password)
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
    authenticateUser
}
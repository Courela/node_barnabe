const usersMgr = require('../managers/users');
const bcrypt = require('bcrypt');

var salt = "$"+process.env.SALT_VERSION+"$"+process.env.SALT_ROUNDS+"$"+process.env.SALT_VALUE;

async function authenticateUser(username, password) {
    var hashPassword = await generatePasswordHash(password);
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

async function generatePasswordHash(password) {
    return await bcrypt.hash(password, salt);
}

module.exports = {
    authenticateUser,
    generatePasswordHash
}
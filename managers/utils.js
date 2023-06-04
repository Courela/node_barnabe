const sgMail = require('@sendgrid/mail')
const generator = require('generate-password');
const authentication = require('../authentication/authentication');
const utilsRepo = require('../repositories/utils');
const usersMgr = require('./users');

sgMail.setApiKey(process.env.SENDGRID_APIKEY)

function getRoles() {
    return utilsRepo.getRoles()
        .then((results) => {
            //console.log(results);
            return results.recordset;
        })
        .catch((err) => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

function getSeasons() {
    return utilsRepo.getSeasons()
        .then((results) => {
            //console.log(results);
            return results.recordset;
        })
        .catch((err) => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

function getSteps() {
    return utilsRepo.getSteps()
        .then((results) => {
            //console.log(results);
            return results.recordset;
        })
        .catch((err) => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

function getPhases() {
    return utilsRepo.getPhases()
        .then((results) => {
            //console.log(results);
            return results.recordset;
        })
        .catch((err) => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

function recoverPassword(email) {
    return usersMgr.getUserByEmail(email)
        .then((u) => {
            if (u != null) {
                var password = generator.generate({
                    length: 16,
                    numbers: true,
                    symbols: true,
                    strict: true
                });
                const msg = {
                    to: u.Email,
                    from: process.env.EMAIL_SENDER,
                    subject: 'Taça Barnabé - Recuperar password',
                    text: 'A nova password para o Utilizador ' + u.Username + ' é ' + password,
                };
                
                sgMail
                    .send(msg)
                    .then((response) => {
                        console.log("Send email status code:", response[0].statusCode);
                        //console.log(response[0].headers);

                        authentication.generatePasswordHash(password)
                            .then((hash) => {
                                console.log("New hash for user: ", u.Username, hash);
                                usersMgr.savePassword(u.Username, hash);
                            })
                            .catch((err) => {
                                console.error(err);
                                throw 'Unexpected error!';
                            });
                    })
                .catch((error) => {
                    console.error(error);
                    console.error(error.response.body);
                });
            } else {
                console.warn("No user found for email", email);
            }
        })
        .catch((err) => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

module.exports = {
    getRoles,
    getSeasons,
    getSteps,
    getPhases,
    recoverPassword
}
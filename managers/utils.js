const bcrypt = require('bcrypt');
const generator = require('generate-password');
const sgMail = require('@sendgrid/mail');
const usersMgr = require('./users');
const utilsRepo = require('../repositories/utils');

sgMail.setApiKey(process.env.SENDGRID_APIKEY);

var salt = "$"+process.env.SALT_VERSION+"$"+process.env.SALT_ROUNDS+"$"+process.env.SALT_VALUE;

async function generatePasswordHash(password) {
    return await bcrypt.hash(password, salt);
}

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

                        generatePasswordHash(password)
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

function getDocuments() {
    return utilsRepo.getDocuments()
        .then((results) => {
            //console.log(results);
            return results.recordset;
        })
        .catch((err) => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

function loadDocument(name, type, link) {
    return utilsRepo.loadDocument(name, type, link)
        .then((results) => {
            return results.rowsAffected;
        })
        .catch((err) => {
            console.error(err);
            throw 'Unexpected error!';
        });
}

module.exports = {
    generatePasswordHash,
    getRoles,
    getSeasons,
    getSteps,
    getPhases,
    recoverPassword,
    getDocuments,
    loadDocument
}
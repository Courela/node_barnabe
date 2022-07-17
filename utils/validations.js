const COMMENTS_MAX_LENGTH = 2000;
const NAME_MAX_LENGTH = 80;
const DOC_ID_MAX_LENGTH = 30;
const EMAIL_MAX_LENGTH = 100;
const PHONE_MAX_LENGTH = 16;
const VOTER_NR_MAX_LENGTH = 10;

function stringLimit(str, limit) {
    //console.log('String limit: ', str, limit);
    return str ? str.substring(0, Math.min(str.length, limit - 1)) : null;
}

function isValidGender(gender) {
    return !gender || ['M','F'].indexOf(gender.toUpperCase()) >= 0;
}

function isValidEmail(email) {
    return (!email || email === '' || email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i));
}

function isValidPhone(phoneNr) {
    //console.log('PhoneNr: ', phoneNr);
    return (!phoneNr || phoneNr === '' || phoneNr.replace(/ /g, '').match(/^(\+351|00351|351)?(9[1236][0-9]{7}|2[1-9][0-9]{7})$/));
}

function isValidDate(date) {
    let result = false;
    try {
        result = new Date(date) != 'Invalid Date';
    }
    catch(err) { }
    return result;
}

module.exports = {
    COMMENTS_MAX_LENGTH,
    NAME_MAX_LENGTH,
    DOC_ID_MAX_LENGTH,
    EMAIL_MAX_LENGTH,
    PHONE_MAX_LENGTH,
    VOTER_NR_MAX_LENGTH,

    stringLimit,
    isValidGender,
    isValidEmail,
    isValidPhone,
    isValidDate
}
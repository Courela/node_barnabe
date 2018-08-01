const mysql = require('mysql');

function ping() {
    var con = mysql.createConnection({
        host: "sabaik6fx8he7pua.chr7pe7iynqr.eu-west-1.rds.amazonaws.com",
        user: process.env.mysql_username,
        password: process.env.mysql_password
    });

    con.connect(function (err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Connected!");
        }
    });
}

module.exports = {
    ping
}

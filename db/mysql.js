const mysql = require('mysql');

function ping(responseCallback) {
    var con = mysql.createConnection({
        host: "sabaik6fx8he7pua.chr7pe7iynqr.eu-west-1.rds.amazonaws.com",
        user: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD
    });

    con.connect(function (err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Connected!");
        }

        if (responseCallback) {
            responseCallback(err || "Connected!");
        }
    });
}

module.exports = {
    ping
}

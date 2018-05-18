const mysql = require('mysql');

function ping() {
    var con = mysql.createConnection({
        host: "mysqlbarnabe.cbaozwl3e3ub.eu-west-2.rds.amazonaws.com",
        user: "barnabe",
        password: "barnabe2018"
    });

    con.connect(function (err) {
        if (err) {
            console.log(err);
        }
        console.log("Connected!");
    });
}

module.exports = {
    ping
}

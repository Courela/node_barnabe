var mysql = require('promise-mysql');

function ping() {
    return executeStatement('SELECT 1 AS ping');
}

function executeStatement(query, values) {
    var connection = getConnection();
    return connection
        .then(function(conn){
            var result = conn.query(query, values ? values.map(v => nullify(v)) : null);
            conn.end();
            return result;
        })
        .catch(function(error){
            if (connection && connection.end) { connection.end(); }
            throw error;
        });
}

function getConnection() {
    return mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });
}

function nullify(val) {
    return val !== null ? val : 'null';
}

/*
const mysql = require('mysql');

// var pool = mysql.createPool({
//     connectionLimit: 10,
//     host: process.env.MYSQL_HOST,
//     user: process.env.MYSQL_USERNAME,
//     password: process.env.MYSQL_PASSWORD,
//     database: process.env.MYSQL_DATABASE
// });

function executeStatement(query, callback, responseCallback) {
    const con = getConnection();
    con.query(query, function (error, results, fields) {
        if (error) {
            console.log(err);
            if (responseCallback) {
                responseCallback(err);
            }
            return;
        }
        //console.log(results);
        if (callback) { 
            const result = callback(results, fields);
            if (responseCallback)
                responseCallback(result);
        }
    });

    con.end();
}

function getConnection() {
    var con = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    });
    con.connect(function (err) {
        if (err) {
            console.log(err);
            if (responseCallback) {
                responseCallback(err);
            }
            return;
        }
    });

    return con;
}

function ping(responseCallback) {
    //console.log(process.env.MYSQL_HOST);
    executeStatement('SELECT * FROM person LIMIT 10', (r,f) => r, responseCallback);
    
    // pool.getConnection((err, con) => {
    //     if (err) {
    //         console.log(err);
    //         if (responseCallback) {
    //             responseCallback(err);
    //         }
    //         return;
    //     }

    //     con.query('SELECT 1 AS solution', function (error, results, fields) {
    //         if (error) {
    //             console.log(error)
    //             if (responseCallback) {
    //                 responseCallback(error);
    //             }
    //             return;
    //         };

    //         console.log('The solution is: ', results[0].solution);

    //         con.release();

    //         if (responseCallback) {
    //             responseCallback('Connected!');
    //         }
    //     });
    // });
}
*/
module.exports = {
    ping,
    executeStatement
}

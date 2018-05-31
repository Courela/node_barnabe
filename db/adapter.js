const sql = require('mssql')

const SQL_MAX_INT = 2147483647;

const config = {
    user: 'barnabe',
    password: 'barnabe',
    server: 'localhost\\SQLEXPRESS', // You can use 'localhost\\instance' to connect to named instance
    database: 'Barnabe'
}

// const config = {
//     user: 'barnabe',
//     password: 'barnabe2000',
//     server: 'barnabe-mssqlinstance.cgc1hxotsbuf.eu-west-1.rds.amazonaws.com',
//     database: 'Barnabe'
// }

let pool = null;

async function initDb() {
    if (!pool) {
        pool = await sql.connect(config);
    }
}

async function getSingle(entity, value) {
    try {
        await initDb();   
        let result = await pool.request()
            .input('input_parameter', sql.Int, value)
            .query('select * from ' + entity + ' where Id = @input_parameter');
        
        return result;
    } catch (err) {
        handleError(err);
    }
}

async function getMultiple(entity, page = 0, pageSize = SQL_MAX_INT) {
    try {
        await initDb();
        let query = ' SELECT * FROM '+entity;
        if (pageSize !== SQL_MAX_INT) {
            query = ' SELECT TOP(@page_size) * FROM ' +
            ' (SELECT ROW_NUMBER() OVER (ORDER BY Id) AS [RowNr], * FROM '+entity+') t ' +
            ' WHERE RowNr >= (@page * @page_size + 1) AND ' +
            '       RowNr <= (@page * @page_size + @page_size) ';
        }
        
        let results = await pool.request()
            .input('page', sql.Int, page)
            .input('page_size', sql.Int, page)
            .query(query);
        
        return results;
    } catch (err) {
        handleError(err);
    }
}

async function statementQuery(query, parameters) {
    try {
        await initDb();
        let result = pool.request();
        parameters.forEach(p => {
            result = result.input(p.name, p.type, p.value);
        });
        return result.query(query);
    } catch (err) {
        handleError(err);
    }
}

function handleError(err) {
    sql.close();
    pool = null;
    console.error('DbAdapter: ' + err);
    throw "Unexpected error!";
}

const sql_int = require('mssql').Int;
const sql_smallint = require('mssql').SmallInt;
const sql_string = require('mssql').VarChar;
const sql_bit = require('mssql').Bit;
const sql_char = require('mssql').Char;
const sql_date = require('mssql').Date;

module.exports = {
    getSingle,
    getMultiple,
    statementQuery,
    sql_smallint,
    sql_int,
    sql_string,
    sql_bit,
    sql_char,
    sql_date
};
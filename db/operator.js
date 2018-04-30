const sql = require('mssql')

const SQL_MAX_INT = 2147483647;

// const config = {
//     user: 'barnabe',
//     password: 'barnabe',
//     server: 'localhost\\SQLEXPRESS', // You can use 'localhost\\instance' to connect to named instance
//     database: 'Barnabe'
// }

const config = {
    user: 'barnabe',
    password: 'barnabe2000',
    server: 'barnabe-mysql.cgc1hxotsbuf.eu-west-1.rds.amazonaws.com',
    database: 'Barnabe'
}

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
        console.error(err);
        return {};
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
        console.error(err);
        return {};
    }
}

async function selectQuery(query, parameters) {
    try {
        await initDb();
        let result = pool.request();
        parameters.forEach(p => {
            result = result.input(p.name, p.type, p.value)    
        });
        return result.query(query);
    } catch (err) {
        console.log(err);
        return {};
    }
}

async function updateQuery(query, parameters) {
    try {
        await initDb();
        let result = pool.request();
        parameters.forEach(p => {
            result = result.input(p.name, p.type, p.value)    
        });
        return result.query(query);
    } catch (err) {
        console.log(err);
        return {};
    }
}

const sql_int = require('mssql').Int;
const sql_string = require('mssql').VarChar;

module.exports = {
    getSingle,
    getMultiple,
    selectQuery,
    sql_int,
    sql_string
};
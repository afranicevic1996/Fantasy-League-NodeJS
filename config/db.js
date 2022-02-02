const mysql = require('mysql2/promise');
const dotenv = require('dotenv').config();

var con      =    mysql.createPool({
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: process.env.DB_CONLIMIT,
    queueLimit: 0
});
module.exports = con;
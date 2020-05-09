const mysql = require('mysql2')

const pool = mysql.createPool({
  host: 'localhost',
  user: 'node_complete',
  password: 'node_complete',
  database: 'node_complete',
  connectionLimit : 10
})

module.exports = pool.promise()
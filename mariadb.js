const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'Youtube',
  // timezone: '+09:00',
  dateStrings: true,
});

module.exports = connection;

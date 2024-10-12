const mysql = require('mysql');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'qxy20090226',
  database: 'student_management'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected');
});

module.exports = db;

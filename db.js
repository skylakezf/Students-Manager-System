const mysql = require('mysql');

// Create a MySQL connection pool
const db = mysql.createPool({
  connectionLimit: 10, // Limit the number of connections in the pool
  host: 'localhost',
  user: 'root',
  password: 'qxy20090226',
  database: 'student_management',
  // Optional: Increase the timeout settings to prevent premature disconnection
  connectTimeout: 10000, // 10 seconds
  acquireTimeout: 10000, // 10 seconds
  waitForConnections: true, // Wait for available connections if all are busy
  queueLimit: 0 // Unlimited requests to wait for a connection
});

// Handle connection errors, including 'PROTOCOL_CONNECTION_LOST'
db.on('error', (err) => {
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('MySQL connection was lost. Reconnecting...');
    handleDisconnect(); // Reconnect on lost connection
  } else {
    throw err; // Throw other errors
  }
});

// Reconnect logic in case of lost connection
function handleDisconnect() {
  db.getConnection((err, connection) => {
    if (err) {
      console.error('Error when connecting to MySQL:', err);
      setTimeout(handleDisconnect, 2000); // Retry after 2 seconds if connection fails
    } else {
      console.log('Reconnected to MySQL');
      connection.release(); // Release the connection after successful reconnection
    }
  });
}

// Check the connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    throw err; // Handle the error here if necessary
  } else {
    console.log('MySQL connected');
    connection.release(); // Release the connection after testing it
  }
});

module.exports = db;


//V1.00 default version
//V1.01 Upload SQL  connect Action
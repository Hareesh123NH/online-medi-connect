const mysql = require('mysql2');

// Create a connection
const connection = mysql.createConnection({
  host: process.env.DBHOST,    
  user: process.env.DBUSER,          
  password: process.env.DBPASSWORD, 
  database: process.env.DBNAME      
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting: ' + err.stack);
    return;
  }
  console.log('Connected as id ' + connection.threadId);
});


module.exports = connection;

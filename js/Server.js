// Server-side code (Node.js with Express)
const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;

// MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'your_database'
});

// API endpoint to get movies
app.get('/api/movies', (req, res) => {
    connection.query('SELECT * FROM movies', (error, results) => {
        if (error) throw error;
        res.json(results);
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

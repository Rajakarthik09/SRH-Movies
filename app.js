const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();

// Set up the MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Your MySQL username
  password: 'Root#@123xx', // Your MySQL password
  database: 'movies_db' // Your database name
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to the database');
});

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (e.g., images, CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Route to render the homepage with movie data
app.get('/', (req, res) => {
  // Query to fetch movies
  db.query('SELECT * FROM movies', (err, results) => {
    if (err) {
      console.error('Error fetching movies:', err);
      return res.status(500).send('Error fetching movies');
    }

    // Render the homepage with the movie data
    res.render('index', { movies: results });
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

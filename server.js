const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MySQL connection setup
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "srhmovies123",
    database: "srh_movies"
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        return;
    }
    console.log("Connected to MySQL database.");
});

// Endpoint for login
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const query = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (results.length > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    });
});

// Endpoint for sign-up user
app.post("/signup_user", (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    // Insert new user into the users table
    const query = "INSERT INTO users (first_name, last_name, email, password, seller) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [firstName, lastName, email, password, 'F'], (err, result) => {
        if (err) {
            console.error("Database insertion error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        res.json({ success: true, message: "User registered successfully" });
    });
});

// Endpoint for sign-up seller
app.post("/signup_seller", (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const query = "INSERT INTO users (first_name, last_name, email, password, seller) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [firstName, lastName, email, password, 'T'], (err, result) => {
        if (err) {
            console.error("Database insertion error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        res.json({ success: true, message: "Seller registered successfully" });
    });
});

// Endpoint to get bookings by email
app.get('/get_bookings', (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const query = 'SELECT * FROM bookings WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length > 0) {
            res.json({ success: true, bookings: results });
        } else {
            res.json({ success: false, message: 'No bookings found' });
        }
    });
});

// Endpoint to update user profile details
app.put('/update_profile', (req, res) => {
    const { email, firstName, lastName, password } = req.body;
    const query = `
        UPDATE users
        SET first_name = ?, last_name = ?, password = ?
        WHERE email = ? and seller = 'F'
    `;
    db.query(query, [firstName, lastName, password, email], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Profile updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    });
});

// Endpoint to get movies for the seller
app.get("/get_movies", (req, res) => {
    const { email } = req.query;
    const query = "SELECT id, genre, name, release_date FROM movies WHERE seller_email = ?";
    db.query(query, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Database error" });
        }
        res.json({ success: true, movies: results });
    });
});

// Endpoint to update user profile details
app.put('/update_seller_profile', (req, res) => {
    const { email, firstName, lastName } = req.body;
    const query = `
        UPDATE users
        SET first_name = ?, last_name = ?
        WHERE email = ? and seller = 'T'
    `;
    db.query(query, [firstName, lastName, email], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Profile updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    });
});

app.get('/get_user_info', (req, res) => {
    const { email } = req.query; // Use `req.query` to fetch query parameters in a GET request.

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const query = `
        SELECT first_name, last_name 
        FROM users 
        WHERE email = ?
    `;

    db.query(query, [email], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length > 0) {
            res.json({ success: true, details: results });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    });
});

// Endpoint to get movie details along with showtimes by name
app.get('/get_movie', (req, res) => {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({ success: false, message: 'Movie name is required' });
    }

    const query = `
        SELECT m.name, m.description, m.release_date, s.theater, s.time, s.day
        FROM movies m
        JOIN showtimes s ON m.id = s.movie_id
        WHERE LOWER(m.name) = LOWER(?)
    `;

    db.query(query, [name], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length > 0) {
            // Structure the response
            const movie = {
                name: results[0].name,
                description: results[0].description,
                release_date: results[0].release_date,
                showtimes: []
            };

            // Group showtimes by day
            results.forEach(row => {
                // Check if the day already exists
                let dayEntry = movie.showtimes.find(showtime => showtime.day === row.day);
                if (!dayEntry) {
                    // If the day doesn't exist, create a new day entry
                    dayEntry = {
                        day: row.day,
                        theaters: []
                    };
                    movie.showtimes.push(dayEntry);
                }

                // Check if the theater exists under the current day
                let theaterEntry = dayEntry.theaters.find(theater => theater.name === row.theater);
                if (!theaterEntry) {
                    // If the theater doesn't exist, create a new theater entry
                    theaterEntry = {
                        name: row.theater,
                        times: []
                    };
                    dayEntry.theaters.push(theaterEntry);
                }

                // Add the time to the theater entry
                theaterEntry.times.push(row.time);
            });

            res.json({ success: true, movie });
        } else {
            res.json({ success: false, message: 'Movie not found' });
        }
    });
});

app.post("/add_movies", (req, res) => {
    const { movies } = req.body;

    if (!movies || !Array.isArray(movies) || movies.length === 0) {
        return res.status(400).json({ success: false, message: "Invalid input data" });
    }

    const movieInsertQuery = `
        INSERT INTO movies (name, genre, description, release_date)
        VALUES (?, ?, ?, ?)
    `;
    const showtimeInsertQuery = `
        INSERT INTO showtimes (movie_id, theater, time, day)
        VALUES (?, ?, ?, ?)
    `;

    const promises = movies.map((movie) => {
        const { movieName, genre, description, releaseDate, theater, showTime, days } = movie;

        return new Promise((resolve, reject) => {
            db.query(movieInsertQuery, [movieName, genre, description, releaseDate], (err, result) => {
                if (err) {
                    console.error("Error inserting movie:", err);
                    return reject(err);
                }

                const movieId = result.insertId;

                db.query(showtimeInsertQuery, [movieId, theater, showTime, days], (err) => {
                    if (err) {
                        console.error("Error inserting showtime:", err);
                        return reject(err);
                    }
                    resolve();
                });
            });
        });
    });

    Promise.all(promises)
        .then(() => {
            res.json({ success: true, message: "Movies and showtimes added successfully!" });
        })
        .catch((error) => {
            console.error("Error adding movies:", error);
            res.status(500).json({ success: false, message: "Failed to add movies and showtimes" });
        });
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
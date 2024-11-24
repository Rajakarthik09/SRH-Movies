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

// Endpoint to fetch movies
app.get('/movies', (req, res) => {
    const query = 'SELECT name, description, release_date, genre, image FROM movies';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching movies:', err);
            return res.status(500).send({ error: 'Failed to fetch movies' });
        }
        res.json(results);
    });
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
    const query = "INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [firstName, lastName, email, password, 'user'], (err, result) => {
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
    const query = "INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [firstName, lastName, email, password, 'seller'], (err, result) => {
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
        WHERE email = ? and role = 'user'
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
        WHERE email = ? and role = 'seller'
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

//Endpoint for getting movie details in edit page
app.get('/get_movie_details', (req, res) => {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Movie Name not found' });
    }
  
    const movieQuery = `
      SELECT name, description, release_date, genre 
      FROM movies 
      WHERE name = ?;
    `;
    const showtimeQuery = `
      SELECT theater, time, day 
      FROM showtimes 
      WHERE movie_id = (SELECT id FROM movies WHERE name = ?);
    `;
  
    db.query(movieQuery, [name], (err, movieResults) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      if (movieResults.length === 0) {
        return res.status(404).json({ success: false, message: 'Movie not found' });
      }
  
      db.query(showtimeQuery, [name], (err, showtimeResults) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Failed to load showtimes' });
        }
        res.json({
          success: true,
          data: { movie: movieResults[0], showtimes: showtimeResults }
        });
      });
    });
  });

// Endpoint to get movie details along with showtimes by name
app.get('/get_movie', (req, res) => {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({ success: false, message: 'Movie name is required' });
    }

    const query = `
        SELECT m.name, m.description, m.release_date, m.image, s.theater, s.time, s.day
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
                image: results[0].image,
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
        INSERT INTO movies (name, genre, description, release_date, image, seller_email)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const showtimeInsertQuery = `
        INSERT INTO showtimes (movie_id, theater, time, day)
        VALUES (?, ?, ?, ?)
    `;

    const promises = movies.map((movie) => {
        const { movieName, genre, description, releaseDate, image_path, userEmail, theater, showTimes, days } = movie;

        return new Promise((resolve, reject) => {
            // Insert movie into movies table
            db.query(movieInsertQuery, [movieName, genre, description, releaseDate, image_path, userEmail], (err, result) => {
                if (err) {
                    console.error("Error inserting movie:", err);
                    return reject(err);
                }

                const movieId = result.insertId;

                /// Insert showtimes for each combination of theater, showtime, and day
                const showtimePromises = theater.flatMap((theater) => {
                    return showTimes.flatMap((time) => {
                        return days.map((day) => {
                            return new Promise((showtimeResolve, showtimeReject) => {
                                db.query(showtimeInsertQuery, [movieId, theater, time, day], (err) => {
                                    if (err) {
                                        console.error("Error inserting showtime:", err);
                                        return showtimeReject(err);
                                    }
                                    showtimeResolve();
                                });
                            });
                        });
                    });
                });

                // Wait for all showtimes to be inserted
                Promise.all(showtimePromises)
                    .then(resolve)
                    .catch(reject);
            });
        });
    });

    // Handle all promises for inserting movies and showtimes
    Promise.all(promises)
        .then(() => {
            res.status(200).json({ success: true, message: "Movies and showtimes saved successfully!" });
        })
        .catch((err) => {
            console.error("Error saving movies and showtimes:", err);
            res.status(500).json({ success: false, message: "An error occurred while saving the movies and showtimes." });
        });
});

// PUT endpoint to update movie details and showtimes
app.put('/update_movie_details', (req, res) => {
    const { movie, showtimes } = req.body;

    // Validation check for required fields
    if (
        !movie ||
        !movie.name ||
        !movie.description ||
        !movie.release_date ||
        !movie.genre ||
        !showtimes ||
        !Array.isArray(showtimes)
    ) {
        return res.status(400).json({ success: false, message: 'Invalid input data' });
    }

    const formattedDate = new Date(movie.release_date).toISOString().split('T')[0];

    // Query to update the movie details
    const updateMovieQuery = `
        UPDATE movies 
        SET description = ?, release_date = ?, genre = ? 
        WHERE name = ?;
    `;

    // Query to delete existing showtimes for the movie
    const deleteShowtimesQuery = `
        DELETE FROM showtimes 
        WHERE movie_id = (SELECT id FROM movies WHERE name = ?);
    `;

    // Query to insert new showtimes
    const insertShowtimeQuery = `
        INSERT INTO showtimes (movie_id, theater, time, day) 
        VALUES ((SELECT id FROM movies WHERE name = ?), ?, ?, ?);
    `;

    // Start updating the movie details
    db.query(updateMovieQuery, [movie.description, formattedDate, movie.genre, movie.name], (err) => {
        if (err) {
            console.error('Error updating movie details:', err);
            return res.status(500).json({ success: false, message: 'Failed to update movie details' });
        }

        // Delete existing showtimes for the movie
        db.query(deleteShowtimesQuery, [movie.name], (err) => {
            if (err) {
                console.error('Error deleting existing showtimes:', err);
                return res.status(500).json({ success: false, message: 'Failed to clear old showtimes' });
            }

            // Insert the updated showtimes
            const showtimePromises = showtimes.map(showtime =>
                new Promise((resolve, reject) => {
                    db.query(
                        insertShowtimeQuery,
                        [movie.name, showtime.theater, showtime.time, showtime.day],
                        (err) => {
                            if (err) {
                                console.error('Error inserting showtime:', err);
                                return reject(err);
                            }
                            resolve();
                        }
                    );
                })
            );

            Promise.all(showtimePromises)
                .then(() => {
                    res.json({ success: true, message: 'Movie and showtime details updated successfully!' });
                })
                .catch((err) => {
                    console.error('Error during showtime insertion:', err);
                    res.status(500).json({ success: false, message: 'Failed to update showtime details' });
                });
        });
    });
});

// DELETE endpoint to remove a specific showtime for a movie
app.delete('/remove_showtime', (req, res) => {
    const { movieName, theater, time, day } = req.body;
  
    // Validation check for required parameters
    if (!movieName || !theater || !time || !day) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }
  
    // Query to delete the specific showtime
    const deleteShowtimeQuery = `
      DELETE FROM showtimes 
      WHERE movie_id = (SELECT id FROM movies WHERE name = ?) 
      AND theater = ? 
      AND time = ? 
      AND day = ?;
    `;
  
    db.query(deleteShowtimeQuery, [movieName, theater, time, day], (err, result) => {
      if (err) {
        console.error('Error deleting showtime:', err);
        return res.status(500).json({ success: false, message: 'Failed to delete showtime' });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Showtime not found' });
      }
  
      res.json({ success: true, message: 'Showtime removed successfully!' });
    });
  });
  
app.get('/get_booked_seats', (req, res) => {
    const { name, time, theater, day } = req.query;

    if (!name || !time || !theater || !day) {
        return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }

    const query = `
        SELECT seat_numbers
        FROM bookings
        WHERE movie_name = ? AND time = ? AND theater = ? AND day = ? AND status = 'Confirmed';
    `;

    db.query(query, [name, time, theater, day], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (results.length > 0) {
            // Aggregate all booked seats
            const bookedSeats = results.reduce((acc, row) => {
                // If seat_numbers is a string, split it into an array
                let seats;
                if (typeof row.seat_numbers === 'string') {
                    seats = row.seat_numbers.split(',');  // Split string into array
                } else if (Array.isArray(row.seat_numbers)) {
                    seats = row.seat_numbers;  // It's already an array
                } else {
                    console.warn(`Unexpected seat_numbers format for row: ${JSON.stringify(row)}`);
                    seats = []; // Default to an empty array if something is wrong
                }
    
                seats.forEach(seat => {
                    const rowLetter = seat.charAt(0);  // Extract row (e.g., 'A' from 'A1')
                    const seatNumber = parseInt(seat.slice(1), 10);  // Extract seat number (e.g., 1 from 'A1')
    
                    // Initialize row in acc if it doesn't exist
                    if (!acc[rowLetter]) acc[rowLetter] = [];
                    acc[rowLetter].push(seatNumber);
                });
                return acc;
            }, {});
    
            res.json({ success: true, bookedSeats });
        } else {
            res.json({ success: true, bookedSeats: {} }); // No seats booked
        }
    });
});

app.post('/book_seat', (req, res) => {
    const { email, movie_name, time, theater, day, seat_numbers, status } = req.body;

    // Check if all required data is provided
    if (!email || !movie_name || !time || !theater || !day || !seat_numbers || !status) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Insert the booking into the database
    const query = `
        INSERT INTO bookings (email, movie_name, day, time, seat_numbers, status, theater)
        VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    const values = [email, movie_name, day, time, JSON.stringify(seat_numbers), status, theater];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ success: true, message: 'Booking successful' });
    });
});

app.get("/get_user_role", (req, res) => {
    // Assuming the logged-in user email is sent as a query parameter or part of session
    const email = req.query.email; // Or use req.session.email if using sessions

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    const query = "SELECT role FROM users WHERE email = ?";
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error("Database fetch error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const userRole = results[0].role;
        res.json({ success: true, userRole: userRole });
    });
});

app.get("/get_sellers", (req, res) => {
    const query = "SELECT * FROM users WHERE role = 'seller'";
    db.query(query, (err, results) => {
      if (err) {
        console.error("Database fetch error:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }
      res.json({ success: true, data: results });
    });
  });

  app.delete('/delete_seller', (req, res) => {
    const { sellerId } = req.body; // Get seller ID from the request body

    // Query to find the seller's email using the seller's ID
    const find_seller_email_query = 'SELECT email FROM users WHERE id = ? AND role = "seller"';

    // Query to delete movies associated with the seller
    const delete_movies_query = 'DELETE FROM movies WHERE seller_email = ?';

    // Query to delete the seller
    const delete_seller_query = 'DELETE FROM users WHERE id = ? AND role = "seller"';

    // Start by finding the seller's email
    db.query(find_seller_email_query, [sellerId], (err, sellerResult) => {
        if (err) {
            console.error('Error finding seller email:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (sellerResult.length === 0) {
            return res.status(404).json({ success: false, message: 'Seller not found' });
        }

        const sellerEmail = sellerResult[0].email; // Get the seller's email

        // Delete movies associated with the seller
        db.query(delete_movies_query, [sellerEmail], (err) => {
            if (err) {
                console.error('Error deleting movies:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            // Delete the seller
            db.query(delete_seller_query, [sellerId], (err, result) => {
                if (err) {
                    console.error('Error deleting seller:', err);
                    return res.status(500).json({ success: false, message: 'Database error' });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ success: false, message: 'Seller not found' });
                }

                res.json({ success: true, message: 'Seller and associated movies deleted successfully' });
            });
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
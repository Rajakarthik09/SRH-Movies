// server.js

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
    const query = "INSERT INTO users (first_name, last_name, email, password, seller) VALUES (?, ?, ?, ?,?)";
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
        res.json({ success: true, message: "User registered successfully" });
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
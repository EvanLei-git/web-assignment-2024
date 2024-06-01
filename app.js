/*
    Sources That Helped:
    https://www.youtube.com/watch?v=xVYa20DCUv0
    https://www.youtube.com/live/zzaByCg5-ME
*/

const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
//const cors = require('cors');  // without it i get a few errors
//const path = require('path');

const app = express();
const host = 'localhost';  // Specify the host
const port = '3000';

//app.use(cors());  
app.use(express.json());
app.use(express.static('public'));

const db = new sqlite3.Database('books.sqlite');

// Create table
db.serialize(() => {
    db.run(`CREATE TABLE books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        author VARCHAR(25) NOT NULL,
        title VARCHAR(40) NOT NULL,
        genre VARCHAR(20) NOT NULL,
        price REAL NOT NULL
    )`, (err) => {
        if (err) {
            console.log("Table exists already\n");
        } else {
            console.log("Table created successfully\n.");
        }
    });
});

app.get('/books', (req, res) => {
    res.json({success: true, message: 'GET /books worked successfully' });
  });
  
app.post('/books', (req, res) => {
    
    const { author, title, genre, price } = req.body;

    // Input checks
    if (!author || !title || !genre || !price || isNaN(price)) {
        return res.status(400).json({ error: 'Please fill all fields correctly.' });
    }

    // Insert data into the database
    const addToDataBase = db.prepare("INSERT INTO books (author, title, genre, price) VALUES (?, ?, ?, ?)");
    addToDataBase.run(author, title, genre, price, function (err) {
        if (err) {
            return res.status(500).json({ error: 'Server error.' });
        }
        const data = { id: this.lastID, author, title, genre, price };
        console.log(`${data.id}, ${data.author}, ${data.title}, ${data.genre}, ${data.price}`);
        res.json({book: data });
    });
    addToDataBase.finalize();
});

app.get('/books/:keyword', (req, res) => {
    const keyword = req.params.keyword;

    db.all("SELECT * FROM books WHERE title LIKE ?", [`%${keyword}%`], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Server error.' });
        }
        res.json(rows);
    });
});


//app.listen(3000);
app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});






require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the MySQL database:', err.message);
    return;
  }
  console.log('Connected to the MySQL database.');
});

app.get('/test', (req, res) => {
  res.send('Database Connected!');
});

// Create a new lead
app.post('/api/leads', (req, res) => {
  const { name, email, source, status, notes } = req.body;
  const leadStatus = status || 'New';
  
  const query = 'INSERT INTO leads (name, email, source, status, notes) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [name, email, source, leadStatus, notes], (err, result) => {
    if (err) {
      console.error('Error inserting lead:', err.message);
      return res.status(500).json({ error: 'Failed to add lead' });
    }
    res.status(201).json({ message: 'Lead added successfully!', id: result.insertId });
  });
});

// Get all leads
app.get('/api/leads', (req, res) => {
  const query = 'SELECT * FROM leads ORDER BY created_at DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching leads:', err.message);
      return res.status(500).json({ error: 'Failed to fetch leads' });
    }
    res.status(200).json(results);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

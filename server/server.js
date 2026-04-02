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

// Update a lead
app.put('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, source, status, notes } = req.body;
  
  const query = 'UPDATE leads SET name = ?, email = ?, source = ?, status = ?, notes = ? WHERE id = ?';
  db.query(query, [name, email, source, status, notes, id], (err, result) => {
    if (err) {
      console.error('Error updating lead:', err.message);
      return res.status(500).json({ error: 'Failed to update lead' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.status(200).json({ message: 'Lead updated successfully!' });
  });
});

// Delete a lead
app.delete('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM leads WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting lead:', err.message);
      return res.status(500).json({ error: 'Failed to delete lead' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.status(200).json({ message: 'Lead deleted successfully!' });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

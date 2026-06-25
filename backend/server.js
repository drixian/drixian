const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware for parsing forms and JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files directly
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Placeholder API Routes for MVP
app.post('/api/auth/register', (req, res) => {
    const { username, email, password } = req.body;
    // Database logic will hook in here
    res.json({ success: true, message: "Registration request received." });
});

app.post('/api/auth/login', (req, res) => {
    res.json({ success: true, message: "Login request received." });
});

// Fallback: Send all unhandled frontend traffic to our index
app.get('*', (path.join(__dirname, '../frontend/public/index.html')));

app.listen(PORT, () => {
    console.log(`Drixian Network core operational on port ${PORT}`);
});

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined. Please set this environment variable.');
    process.exit(1);
}

// 注册用户
router.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: 'Error hashing password' });
        }

        db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ message: 'Email already exists' });
                }
                return res.status(500).json({ message: 'Error registering user', error: err.message });
            }
            res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
        });
    });
});

// 登录用户
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging in', error: err.message });
        }
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ message: 'Error comparing passwords' });
            }
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '12h' });
            res.json({ message: 'Logged in successfully', token, userId: user.id });
        });
    });
});

module.exports = router;

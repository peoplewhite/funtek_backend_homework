import express from "express";
import bcrypt from "bcrypt";
import mysql from 'mysql';

const app = express();
app.use(express.json());

const db = mysql.createConnection({
    host: '35.225.77.201',
    user: 'funtek',
    password: '123456',
    database: 'myfirst',
});

app.post('/api/users', async(req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Invalid request body' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
        db.query(query, [username, email, hashedPassword], (error, results) => {
            if (error) throw error;
            return res.status(201).json({ userId: results.insertId });
        });
    } catch (error) {
        console.error('Error post user:', error);
        return res.status(500).json({ error: 'An error occurred' });
    }
});
app.get('/api/users', async(req, res) => {
    try {
        const query = 'SELECT * FROM users';
        db.query(query, (error, results) => {
            if (error) throw error;
            return res.status(200).json({users: results});
        });
    } catch (error) {
        console.error('Error retrieving users:', error);
        return res.status(500).json({ error: 'An error occurred' });
    }
});
app.get('/api/user/:userId', async(req, res) => {
    try {
        const userId = req.params.userId;
        const query = 'SELECT * FROM users WHERE id = ?';
        db.query(query, [userId], (error, results) => {
            if (error) throw error;
            if (results.length === 0) return res.status(404).json({ error: 'User not found' });
            return res.status(200).json({user: results[0]});
        });

    } catch (error) {
        console.error('Error retrieving user:', error);
        return res.status(500).json({ error: 'An error occurred' });
    }
});

app.listen(3000, async () => {
    console.log('Server is up on port 3000');

    db.query(`CREATE DATABASE IF NOT EXISTS myfirst`, (error) => {
        if (error) throw error;
        console.log(`Database "myfirst" created or already exists`);
        const tableFields = `
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255),
            nickname VARCHAR(255),
            email VARCHAR(255),
            password_hash VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `;

        db.query(`CREATE TABLE IF NOT EXISTS users (${tableFields})`, (error) => {
            if (error) throw error;
            console.log('Table "users" created or already exists');
        });
    });
});
const express = require('express');
const router = express.Router();
const db = require('../database');
const authenticateToken = require('../middleware/auth');

// 获取所有应用
router.get('/', authenticateToken, (req, res) => {
    const userId = req.userId;
    db.all('SELECT * FROM applications WHERE userId = ?', [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching applications', error: err.message });
        }
        res.json(rows);
    });
});

// 添加应用
router.post('/', authenticateToken, (req, res) => {
    const { name, url, notes, category } = req.body;
    const userId = req.userId;

    if (!name || !url) {
        return res.status(400).json({ message: 'Name and URL are required' });
    }

    db.run('INSERT INTO applications (userId, name, url, notes, category) VALUES (?, ?, ?, ?, ?)',
        [userId, name, url, notes, category],
        function(err) {
            if (err) {
                return res.status(500).json({ message: 'Error adding application', error: err.message });
            }
            res.status(201).json({ id: this.lastID, name, url, notes, category });
        }
    );
});

// 更新应用
router.put('/:id', authenticateToken, (req, res) => {
    const { name, url, notes, category } = req.body;
    const appId = req.params.id;
    const userId = req.userId;

    if (!name || !url) {
        return res.status(400).json({ message: 'Name and URL are required' });
    }

    db.run('UPDATE applications SET name = ?, url = ?, notes = ?, category = ? WHERE id = ? AND userId = ?',
        [name, url, notes, category, appId, userId],
        function(err) {
            if (err) {
                return res.status(500).json({ message: 'Error updating application', error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Application not found or not authorized' });
            }
            res.json({ message: 'Application updated successfully' });
        }
    );
});

// 删除应用
router.delete('/:id', authenticateToken, (req, res) => {
    const appId = req.params.id;
    const userId = req.userId;

    db.run('DELETE FROM applications WHERE id = ? AND userId = ?', [appId, userId], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Error deleting application', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Application not found or not authorized' });
        }
        res.json({ message: 'Application deleted successfully' });
    });
});

module.exports = router;

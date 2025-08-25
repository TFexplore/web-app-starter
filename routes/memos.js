const express = require('express');
const router = express.Router();
const db = require('../database');
const authenticateToken = require('../middleware/auth');

// 获取所有备忘录
router.get('/', authenticateToken, (req, res) => {
    const userId = req.userId;
    db.all('SELECT * FROM memos WHERE userId = ? ORDER BY createdAt DESC', [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching memos', error: err.message });
        }
        res.json(rows);
    });
});

// 添加备忘录
router.post('/', authenticateToken, (req, res) => {
    const { content } = req.body;
    const userId = req.userId;

    if (!content) {
        return res.status(400).json({ message: 'Memo content is required' });
    }

    db.run('INSERT INTO memos (userId, content) VALUES (?, ?)',
        [userId, content],
        function(err) {
            if (err) {
                return res.status(500).json({ message: 'Error adding memo', error: err.message });
            }
            res.status(201).json({ id: this.lastID, content, createdAt: new Date().toISOString() });
        }
    );
});

// 更新备忘录
router.put('/:id', authenticateToken, (req, res) => {
    const { content } = req.body;
    const memoId = req.params.id;
    const userId = req.userId;

    if (!content) {
        return res.status(400).json({ message: 'Memo content is required' });
    }

    db.run('UPDATE memos SET content = ? WHERE id = ? AND userId = ?',
        [content, memoId, userId],
        function(err) {
            if (err) {
                return res.status(500).json({ message: 'Error updating memo', error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Memo not found or not authorized' });
            }
            res.json({ message: 'Memo updated successfully' });
        }
    );
});

// 删除备忘录
router.delete('/:id', authenticateToken, (req, res) => {
    const memoId = req.params.id;
    const userId = req.userId;

    db.run('DELETE FROM memos WHERE id = ? AND userId = ?', [memoId, userId], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Error deleting memo', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Memo not found or not authorized' });
        }
        res.json({ message: 'Memo deleted successfully' });
    });
});

module.exports = router;

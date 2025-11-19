const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const { domain, time, classification, timestamp } = req.body;

  db.run('INSERT INTO time_entries (domain, time, classification, timestamp) VALUES (?, ?, ?, ?)',
    [domain, time, classification || 'neutral', timestamp], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Time entry saved', id: this.lastID });
  });
});

router.get('/analytics', (req, res) => {
  const db = req.app.locals.db;
  const { period = 'week' } = req.query;
  const now = new Date();
  let startDate;

  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  const startDateStr = startDate.toISOString();

  db.all('SELECT * FROM time_entries WHERE timestamp >= ?', [startDateStr], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const domainStats = {};
    let totalProductive = 0;
    let totalUnproductive = 0;

    rows.forEach(row => {
      if (!domainStats[row.domain]) {
        domainStats[row.domain] = { time: 0, classification: row.classification };
      }
      domainStats[row.domain].time += row.time;

      if (row.classification === 'productive') {
        totalProductive += row.time;
      } else if (row.classification === 'unproductive') {
        totalUnproductive += row.time;
      }
    });

    res.json({
      domainStats,
      totalProductive,
      totalUnproductive,
      period,
    });
  });
});

module.exports = router;

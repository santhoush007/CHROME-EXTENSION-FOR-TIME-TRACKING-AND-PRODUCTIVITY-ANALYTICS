const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const db = req.app.locals.db;
  db.all('SELECT * FROM categories', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const categories = rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      domains: JSON.parse(row.domains)
    }));
    res.json(categories);
  });
});

router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const { name, type, domains } = req.body;
  const domainsJson = JSON.stringify(domains);

  db.run('INSERT INTO categories (name, type, domains) VALUES (?, ?, ?)',
    [name, type, domainsJson], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, name, type, domains });
  });
});

router.put('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { name, type, domains } = req.body;
  const domainsJson = JSON.stringify(domains);

  db.run('UPDATE categories SET name = ?, type = ?, domains = ? WHERE id = ?',
    [name, type, domainsJson, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ id: req.params.id, name, type, domains });
  });
});

router.delete('/:id', (req, res) => {
  const db = req.app.locals.db;
  db.run('DELETE FROM categories WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted' });
  });
});

module.exports = router;

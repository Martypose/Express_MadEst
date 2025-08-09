// routes/medidastablas.js
const express = require('express');
const router = express.Router();
const db = require('../lib/db');

// Listar medidas_tablas
router.get('/', (req, res) => {
  db.query('SELECT * FROM medidas_tablas', (err, rows) => {
    if (err) return res.status(500).send('Error en la consulta');
    res.json(rows);
  });
});

// Insertar nueva medida_tabla
router.post('/', (req, res) => {
  const medida = req.body;
  db.query('INSERT INTO medidas_tablas SET ?', medida, (err) => {
    if (err) return res.status(500).send('Error en el insert');
    res.send('Insertado correctamente');
  });
});

// Actualizar medida_tabla por ID
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const medida = req.body;
  db.query('UPDATE medidas_tablas SET ? WHERE id = ?', [medida, id], (err) => {
    if (err) return res.status(500).send('Error en la actualización');
    res.send('Actualizado correctamente');
  });
});

// Borrar medida_tabla por ID
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM medidas_tablas WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).send('Error en el borrado');
    res.send('Borrado correctamente');
  });
});

module.exports = router;

// routes/medidastablas.js
const express = require('express');
const router = express.Router();
const dbConn = require('../lib/db');

// Obtener todas las medidas_tablas
router.get('/', async (req, res) => {
  try {
    const rows = await dbConn.query('SELECT * FROM medidas_tablas');
    res.json(rows);
  } catch (err) {
    console.log('Error en la consulta:', err);
    res.status(500).send('Error en la consulta');
  }
});

// Insertar una nueva medida ideal
router.post('/', async (req, res) => {
  try {
    await dbConn.query('INSERT INTO medidas_tablas SET ?', [req.body]);
    res.send('Insertado correctamente');
  } catch (err) {
    console.log('Error en el insert:', err);
    res.status(500).send('Error en el insert');
  }
});

// Actualizar por ID
router.put('/:id', async (req, res) => {
  try {
    await dbConn.query('UPDATE medidas_tablas SET ? WHERE id = ?', [req.body, req.params.id]);
    res.send('Actualizado correctamente');
  } catch (err) {
    console.log('Error en la actualización:', err);
    res.status(500).send('Error en la actualización');
  }
});

// Borrar por ID
router.delete('/:id', async (req, res) => {
  try {
    await dbConn.query('DELETE FROM medidas_tablas WHERE id = ?', [req.params.id]);
    res.send('Borrado correctamente');
  } catch (err) {
    console.log('Error en el borrado:', err);
    res.status(500).send('Error en el borrado');
  }
});

module.exports = router;

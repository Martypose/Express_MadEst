var express = require('express');
var dbConn = require('../lib/db');
var router = express.Router();

// Obtener todas las medidas_tablas
router.get('/', function(req, res) {
  dbConn.query('SELECT * FROM medidas_tablas', function(err, result) {
    if (err) {
      console.log('Error en la consulta: ' + err);
    }
    res.json(result);
  });
});

// GET todas las medidas reales
router.get('/', function(req, res) {
  dbConn.query('SELECT * FROM medidas_cenital', function(err, result) {  // Cambia a tu tabla mm
    if (err) console.log('Error en la consulta: ' + err);
    res.json(result);
  });
});

router.post('/', function(req, res) {
  let medida = req.body;
  if (!medida.ancho_mm || !medida.grosor_mm) return res.status(400).send('Faltan mm reales');
  dbConn.query('INSERT INTO medidas_cenital SET ?', medida, function(err, result) {
    if (err) console.log('Error en el insert: ' + err);
    res.send('Insertado correctamente');
  });
});
// Insertar una nueva fila en medidas_tablas
router.post('/', function(req, res) {
  let medida = req.body;
  dbConn.query('INSERT INTO medidas_tablas SET ?', medida, function(err, result) {
    if (err) {
      console.log('Error en el insert: ' + err);
    }
    res.send('Insertado correctamente');
  });
});

// Actualizar una fila en medidas_tablas por ID
router.put('/:id', function(req, res) {
  let id = req.params.id;
  let medida = req.body;
  dbConn.query('UPDATE medidas_tablas SET ? WHERE id = ?', [medida, id], function(err, result) {
    if (err) {
      console.log('Error en la actualización: ' + err);
    }
    res.send('Actualizado correctamente');
  });
});

// Eliminar una fila en medidas_tablas por ID
router.delete('/:id', function(req, res) {
  let id = req.params.id;
  dbConn.query('DELETE FROM medidas_tablas WHERE id = ?', [id], function(err, result) {
    if (err) {
      console.log('Error en el borrado: ' + err);
    }
    res.send('Borrado correctamente');
  });
});

module.exports = router;
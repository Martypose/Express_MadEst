var express = require('express')
var dbConn  = require('../lib/db')
var router = express.Router()

/* GET compras page. */
router.get('/', function(req, res, next) {
  res.render('compras')
});

router.post('/', function(req, res, next) {
  let nombre = req.body.nombre
  let telefono = req.body.telefono
  let localizacion = req.body.localizacion
  let especie = req.body.especie
  let observaciones = req.body.observaciones

  //enviar datos a mysql, enviar datos a correo
  dbConn.query('INSERT INTO avisos SET nombre=?, telefono=?, localizacion=?, especies=?, observaciones=?', [nombre,telefono,localizacion,especie,observaciones], function(err, result) {
    //if(err) throw err
    if (err) {
      console.log("Error en el insert")
    } else {
        //mostrar mensaje éxito
        res.redirect('compras/exito')
    }
  })
});

router.get('/exito', function(req, res, next) {
  res.render('avisoRecibido')
});

module.exports = router

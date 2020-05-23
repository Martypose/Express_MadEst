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

  //enviar datos a mysql
  dbConn.query('INSERT INTO avisos SET nombre=?, telefono=?, localizacion=?, especies=?, observaciones=?, fecha=curdate()', [nombre, telefono, localizacion, especie, observaciones], function(err, result) {
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

router.get('/avisos', function(req,res){
  //Dos opciones, paquetes bajados o no.
  //Hago una consulta a la BD con el parámetro que me llega para elegir un o otro tipo
  //En este caso según ->vista:

  dbConn.query(`SELECT * FROM avisos WHERE vista=${req.query.vista};`, function (err, result, fields) {
    if (err) {
      console.log('Error en la consulta a la bd '+ err)
    }
    console.log(result);
    res.json(result);
  });
  //Enviar resultado en forma de JSON

  
})

module.exports = router

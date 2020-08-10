const express = require('express')
const router = express.Router();
var dbConn  = require('../lib/db')

//Si hacemos un get a transportista
router.get('/transportista', function(req,res){
  //Dos opciones, paquetes macizos o no.
  //Hago una consulta a la BD con el parámetro que me llega para elegir un o otro tipo
  //En este caso según ->barroteado:

  dbConn.query(`Select * from transportista;`, function (err, result, fields) {
    if (err) {
      console.log('Error en la consulta a la bd '+ err)
    }
    //Enviar resultado en forma de JSON
    res.json(result);
  });
})
module.exports = router

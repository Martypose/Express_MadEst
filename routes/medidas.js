var express = require('express')
var dbConn  = require('../lib/db')
var router = express.Router()

router.get('/',function(req,res){

    //En este caso según ->vista: (si la madera ha sido vista o no)
  
    dbConn.query(`SELECT * FROM medidas;`, function (err, result, fields) {
      if (err) {
        console.log('Error en la consulta a la bd '+ err)
      }
      console.log(result);
        //Enviar resultado en forma de JSON
      res.json(result);
    });
  
  })

  router.post('/',function(req,res){
    let medida = req.body.medida
    console.log(medida)
  
    dbConn.query(`Insert into medidas VALUES(?),`[medida], function (err, result) {
      if (err) {
        console.log('Error en el insert'+ err)
      }
        //Enviar resultado en forma de JSON
      res.send('Se ha insertado correctamente');
    });
  
  })
  module.exports = router

  
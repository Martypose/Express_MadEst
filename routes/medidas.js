var express = require('express')
var dbConn  = require('../lib/db')
var router = express.Router()

router.get('/',function(req,res){
  
    dbConn.query(`SELECT * FROM medidas;`, function (err, result, fields) {
      if (err) {
        console.log('Error en la consulta a la bd '+ err)
      }
      console.log(result);
        //Enviar resultado en forma de JSON
      res.json(result);
    });
  
  })

  router.get('/calidades',function(req,res){
  
    dbConn.query(`SELECT * FROM calidad;`, function (err, result, fields) {
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
    console.log('ancho:'+medida.ancho+'.')

    if(medida.ancho==''){
      medida.ancho=null;
      console.log(medida.ancho)
    }
   
  
    dbConn.query(`Insert into medidas SET id=?, ancho=?, grosor=?, largo=?, esMedible=?, barroteado=?, homogeneo=?, calidad=?`,[medida.id, medida.ancho, medida.grosor, medida.largo, medida.esMedible, medida.barroteado, medida.homogeneo, medida.calidad], function (err, result) {
      if (err) {
        console.log('Error en el insert:'+ err)
      }
        //Enviar resultado en forma de JSON
      res.send('Se ha insertado correctamente');
    });
  
  })

  router.delete('/:id',function(req,res){
    console.log(`Intentando borrar ${req.params.id}`)

    dbConn.query('DELETE FROM medidas WHERE id=?',[req.params.id], function (err, result) {
      if (err) {
        console.log('Error en el borrado'+ err)
      }
        //Enviar resultado en forma de JSON
      res.send('Borrado correctamente');
    });
  })
  module.exports = router

  
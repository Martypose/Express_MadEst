const express = require('express');
const router = express.Router();
var dbConn  = require('../lib/db')

//Si hacemos una request de tipo post a la dirección actual

router.post('/', function(req, res) {

    let paquete = req.body.paquete

    //Guardar paquete
    dbConn.query('INSERT INTO paquete SET id=?, ancho=?, fechaCreacion=?, seco=?, estado=?, barroteado=?, homogeneo=?, cantidades=?, grosor=?, largo=?, cubico=?, numpiezas=?, calidad=?', [paquete.id, paquete.ancho, paquete.fecha, paquete.seco, paquete.estado,paquete.barroteado, paquete.homogeneo,paquete.cantidades, paquete.grosor, paquete.largo, paquete.cubico, paquete.numpiezas, paquete.calidad], function(err, result) {
        //if(err) throw err
        if (err) {
          console.log("Error en el insert "+ err.errno)

          if(err.errno==1062){
            res.send('id repetido');
          }
        } else {
            //mostrar mensaje éxito
            console.log('exito al guardar en bd');
            res.send('exito al guardar en bd');
        }
      })
    
  
})

router.post('/buscarPaquetes', function(req, res) {

  let consulta = req.body.consulta

  dbConn.query(consulta, function (err, result, fields) {
    if (err) {
      console.log('Error en la consulta a la bd '+ err)
    }
    console.log(result);
    //Enviar resultado en forma de JSON
    res.json(result);
  });

  

})

router.put('/:id', function(req, res) {

  let idPaquete = Number(req.params.id)
  let paquete = req.body.paquete
  console.log(paquete.estado)

  //Guardar paquete
  dbConn.query('UPDATE paquete SET ancho=?, fechaCreacion=?, seco=?, estado=?, barroteado=?, homogeneo=?, cantidades=?, grosor=?, largo=?, cubico=?, numpiezas=?, calidad=? WHERE id=?', [paquete.ancho, paquete.fecha, paquete.seco, paquete.estado,paquete.barroteado, paquete.homogeneo,paquete.cantidades, paquete.grosor, paquete.largo, paquete.cubico, paquete.numpiezas, paquete.calidad, idPaquete], function(err, result) {
      //if(err) throw err
      if (err) {
        console.log("Error en el update "+ err)
      } else {
          //mostrar mensaje éxito
          console.log('exito al guardar en bd');
          res.send('Actualizado con éxito.');
      }
    })

  

})

//Si hacemos un get
router.get('/', function(req,res){
  //Dos opciones, paquetes macizos o no.
  //Hago una consulta a la BD con el parámetro que me llega para elegir un o otro tipo
  //En este caso según ->barroteado:

  dbConn.query(`SELECT * FROM paquete WHERE barroteado=${req.query.barroteado} AND estado='stock';`, function (err, result, fields) {
    if (err) {
      console.log('Error en la consulta a la bd '+ err)
    }
    console.log(result);
    //Enviar resultado en forma de JSON
    res.json(result);
  });
  

  
})



module.exports = router
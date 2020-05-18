const express = require('express');
const router = express.Router();
var dbConn  = require('../lib/db')

//Si hacemos una request de tipo post a la dirección actual

router.post('/', function(req, res) {

    let paquete = req.body.paquete

    //Guardar paquete
    dbConn.query('INSERT INTO paquete SET id=?, fechaCreacion=?, seco=?, estado=?, barroteado=?, homogeneo=?, cantidades=?, grosor=?, largo=?, cubico=?, numpiezas=?, calidad=?', [paquete.id, paquete.fecha, paquete.seco, paquete.estado,paquete.barroteado, paquete.homogeneo,paquete.cantidades, paquete.grosor, paquete.largo, paquete.cubico, paquete.numpiezas, paquete.calidad], function(err, result) {
        //if(err) throw err
        if (err) {
          console.log("Error en el insert "+ err)
        } else {
            //mostrar mensaje éxito
            console.log('exito al guardar en bd');
            res.send('exito al guardar en bd');
        }
      })
    
  
})

//Si hacemos un get
router.get('/', function(req,res){
  //Dos opciones, paquetes bajados o no.
  //Hago una consulta a la BD con el parámetro que me llega para elegir un o otro tipo
  //En este caso según ->barroteado:

  dbConn.query(`SELECT * FROM paquete WHERE barroteado=${req.query.barroteado}`, function (err, result, fields) {
    if (err) {
      console.log('Error en la consulta a la bd '+ err)
    }
    console.log(result);
    res.json(result);
  });
  //Enviar resultado en forma de JSON

  
})

module.exports = router
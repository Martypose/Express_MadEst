const express = require('express');
const router = express.Router();
var dbConn  = require('../lib/db')

//Si hacemos una request de tipo post a la dirección actual

router.post('/', function(req, res) {

    let paquete = req.body.paquete

    //Aquí debería guardar el paquete que recibo en la base de datos.

    dbConn.query('INSERT INTO paquete SET id=?, fechaCreacion=?, seco=?, estado=?, barroteado=?, homogeneo=?, grosor=?, largo=?, cubico=?, numpiezas=?, calidad=?', [paquete.id, paquete.fecha, paquete.seco, paquete.estado,paquete.barroteado, paquete.homogeneo, paquete.grosor, paquete.largo, paquete.cubico, paquete.numpiezas, paquete.calidad], function(err, result) {
        //if(err) throw err
        if (err) {
          console.log("Error en el insert"+ err)
        } else {
            //mostrar mensaje éxito
            console.log('exito al guardar en bd');
            res.send('exito al guardar en bd');
        }
      })


})


router.get('/', function(req,res){
    if(req){
    }
    //Aqui obtengo los datos de los paquetes que deseo mostrar y los envio


})

module.exports = router
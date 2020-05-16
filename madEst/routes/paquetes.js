const express = require('express');
const router = express.Router();
var dbConn  = require('../lib/db')

//Si hacemos una request de tipo post a la dirección actual

router.post('/', function(req, res) {

    let paquete = req.body.paquete

    res.send(paquete)

    //Aquí debería guardar el paquete que recibo en la base de datos.

})


router.get('/', function(req,res){
    if(req){
    }
    //Aqui obtengo los datos de los paquetes que deseo mostrar y los envio


})

module.exports = router
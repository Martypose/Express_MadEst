const express = require('express');
const router = express.Router();
var dbConn  = require('../lib/db')

//Si hacemos una request de tipo post a la dirección actual

router.post('/', function(req, res, next) {

    let paquete = req.body.paquete

    res.send("He guardo el paquete con id:" +paquete.id+' y cantidades: '+paquete.cantidades)
  


});

module.exports = router
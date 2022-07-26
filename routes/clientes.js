const express = require('express');
const router = express.Router();
var dbConn  = require('../lib/db');


//Si hacemos un get
router.get('/', function(req,res){

  dbConn.query(`Select * from cliente;`, function (err, result, fields) {
    if (err) {
      console.log('Error en la consulta a la bd'+ err)
    }
    //Enviar resultado en forma de JSON
    res.json(result);
  });
})
module.exports = router

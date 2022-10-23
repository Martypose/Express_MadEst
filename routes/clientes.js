const express = require('express');
const router = express.Router();
const dbConn  = require('../lib/db')


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

router.post('/',function(req,res){
  console.log("f")
  console.log(req.body)

  let cliente = req.body
  console.log(cliente)

  dbConn.query(`Insert into cliente SET cif=?, nombre=?, direccion=?, telefono=?`,[cliente.cif, cliente.nombre, cliente.direccion, Number(cliente.telefono)], function (err, result) {
    if (err) {
      console.log('Error en el insert:'+ err)
      res.status(222).send('Error insert')
    }else{
      //Enviar resultado en forma de JSON
    res.send('Se ha insertado correctamente');
    }
      
  });

})

module.exports = router

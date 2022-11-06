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

router.delete('/:cif',function(req,res){
  console.log(`Intentando borrar ${req.params.id}`)

  dbConn.query('DELETE FROM cliente WHERE cif=?',[req.params.cif], function (err, result) {
    if (err) {
      console.log('Error en el borrado'+ err)
    }
      //Enviar resultado en forma de JSON
    res.send('Borrado correctamente');
  });
})

router.put('/' ,function(req, res) {

  let cliente = req.body  
  console.log(cliente)

  //Actualizar el cliente
  dbConn.query('UPDATE cliente SET nombre=?, direccion=?, telefono=? WHERE cif=?', [cliente.nombre, cliente.direccion, cliente.telefono, cliente.cif], function(err, result) {
      //if(err) throw err
      if (err) {
        console.log("Error en el update "+ err)
        res.send('Error '+err.message);
      } else {
          //mostrar mensaje éxito
          console.log('exito al guardar en bd');
          res.send('Actualizado con éxito.');
      }
    })

  

})

module.exports = router

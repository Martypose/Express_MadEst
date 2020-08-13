const express = require('express');
const seguridad = require('../lib/seguridad')
const router = express.Router();
var dbConn  = require('../lib/db')

//Si hacemos una request de tipo post a la dirección actual

router.post('/',seguridad, function(req, res) {

    let paquete = req.body.paquete

    //Guardar paquete en BD
    dbConn.query('INSERT INTO paquete SET ID=?,fechaCreacion=?, estado=?, cantidades=?, cubico=?, numpiezas=?, medida=?', [0,paquete.fecha, paquete.estado,paquete.cantidades, paquete.cubico, paquete.numpiezas, paquete.medida], function(err, result) {
        //if(err) throw err
        if (err) {
          console.log("Error en el insert "+ err.errno)

          //Sí el error clave duplicada informamos
          if(err.errno==1062){
            res.send('id repetido');
          }else{
          //Informamos de otro error
            res.send('error insert');
          }
        } else {
            //mostrar mensaje éxito
            console.log('exito al guardar en bd');
            res.send('exito al guardar en bd');
        }
      })
    
  
})

router.post('/buscarPaquetes', seguridad, function(req, res) {

  let consulta = req.body.consulta

  dbConn.query(consulta, function (err, result, fields) {
    if (err) {
      console.log('Error en la consulta a la bd '+ err)
    }
    console.log(result);
    //Enviar resultado en forma de JSON
    res.send(result);
  });

  

})

router.put('/:id', seguridad ,function(req, res) {

  //Guardar paquete
  dbConn.query('UPDATE paquete SET fechaCreacion=?, estado=?, cantidades=?, cubico=?, numpiezas=?, medida=? WHERE id=?', [paquete.fecha, paquete.estado,paquete.cantidades, paquete.cubico, paquete.numpiezas, paquete.medida, paquete.ID], function(err, result) {
      //if(err) throw err
      if (err) {
        console.log("Error en el update "+ err)
        res.send('Error'+err.message)
      } else {
          //mostrar mensaje éxito
          console.log('exito al guardar en bd');
          res.send('Actualizado con éxito.');
      }
    })

  

})

//Si hacemos un get
router.get('/',seguridad, function(req,res){

  dbConn.query(`Select *  from paquete as a,medidas as b where a.medida=b.id;`, function (err, result, fields) {
    if (err) {
      console.log('Error en la consulta a la bd '+ err)
    }
    //Enviar resultado en forma de JSON
    res.json(result);
  });
})
module.exports = router

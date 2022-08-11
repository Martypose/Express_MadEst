const express = require('express');
const router = express.Router();
const dbConn  = require('../lib/db')

//Si hacemos una request de tipo post a la dirección actual

router.post('/', function(req, res) {
  console.log(req.body)

    let paquete = req.body

    paquete.cantidades = paquete.cantidades.toString()

    //Guardar paquete en BD
    dbConn.query('INSERT INTO paquete SET ID=?,fechaCreacion=?, estado=?, cantidades=?, cubico=?, numpiezas=?, medida=?, fechaBajado=?, fechaVenta=?', [0,paquete.fechaCreacion, paquete.estado,paquete.cantidades, paquete.cubico, paquete.numpiezas, paquete.medida,paquete.fechaBajado,paquete.fechaVenta], function(err, result) {
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
            dbConn.query('SELECT MAX(ID) as id FROM paquete;', function (err, result, fields) {
              if (err) {
                console.log('Error en la consulta a la bd '+ err)
              }         
              let results=JSON.parse(JSON.stringify(result))
              //Enviar resultado en forma de JSON
              let numero=results[0].id.toString();
              res.send(`Éxito! El numero de paquete es: ${numero}`);

            });
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
    res.send(result);
  });

  

})

router.put('/:id' ,function(req, res) {

  let idPaquete = Number(req.params.id)
  let estado = req.body.estado

  //Guardar paquete
  dbConn.query('UPDATE paquete SET estado=? WHERE ID=?', [estado, idPaquete], function(err, result) {
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

//Si hacemos un get
router.get('/', function(req,res){

  dbConn.query(`Select *  from paquete;`, function (err, result, fields) {
    if (err) {
      console.log('Error en la consulta a la bd '+ err)
    }
    //Enviar resultado en forma de JSON
    res.json(result);
  });
})
module.exports = router

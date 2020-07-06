var express = require('express')
var dbConn  = require('../lib/db')
const seguridad = require('../lib/seguridad')
var router = express.Router()

/* GET compras page. */
router.get('/', function(req, res, next) {
  res.render('compras')
});

router.post('/', function(req, res, next) {
  let nombre = req.body.nombre
  let telefono = req.body.telefono
  let localizacion = req.body.localizacion
  let especie = req.body.especie
  let observaciones = req.body.observaciones

  //enviar datos a mysql
  dbConn.query('INSERT INTO avisos SET nombre=?, telefono=?, localizacion=?, especies=?, observaciones=?, fecha=curdate()', [nombre, telefono, localizacion, especie, observaciones], function(err, result) {
    //if(err) throw err
    if (err) {
      console.log("Error en el insert"+err.message)
    } else {
        //mostrar mensaje éxito
        res.redirect('compras/exito')
    }
  })
});

router.get('/exito' , function(req, res, next) {
  res.render('avisoRecibido')
});

router.get('/avisos', seguridad ,function(req,res){

  //En este caso según ->vista: (si la madera ha sido vista o no)

  dbConn.query(`SELECT * FROM avisos WHERE vista=${req.query.vista};`, function (err, result, fields) {
    if (err) {
      console.log('Error en la consulta a la bd '+ err)
    }
    console.log(result);
      //Enviar resultado en forma de JSON
    res.json(result);
  });

  
})


router.put(`/avisos/:id`, seguridad , (request, res) => {
  let idAviso = Number(request.params.id);

  //Actualizar el aviso en la BD
  dbConn.query('UPDATE avisos SET vista=? WHERE id=?', [1, idAviso], function(err, result) {
    //if(err) throw err
    if (err) {
      console.log("Error en el update")
    } else {
        //mostrar mensaje éxito
        res.send('Actualizado con éxito.')
    }
  })

  
});

router.delete(`/avisos/:id`, seguridad , (request, res) => {
  const idAviso = Number(request.params.id);

  //Actualizar el aviso en la BD
  dbConn.query('DELETE FROM avisos WHERE id=?', [idAviso], function(err, result) {
    //if(err) throw err
    if (err) {
      console.log("Error en el update")
    } else {
        //mostrar mensaje éxito
        res.send('borrado con éxito.')
    }
  })

  
});

module.exports = router

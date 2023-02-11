const express = require('express');
const router = express.Router();
const dbConn  = require('../lib/db')


//Si hacemos un get
router.get('/', function(req,res){

  var dataToSend;
  // spawn new child process to call the python script
  const python = spawn('python', ['C:/Users/marti/OneDrive/Escritorio/script.py']);
  // collect data from script
  python.stdout.on('data', function (data) {
   console.log('Pipe data from python script ...');
   dataToSend = data.toString();
  });
  // in close event we are sure that stream from child process is closed
  python.on('close', (code) => {
  console.log(`child process close all stdio with code ${code}`);
  // send data to browser
  res.send(dataToSend)
 
})
app.listen(port, () => console.log(`Example app listening on port 
${port}!`))

  // dbConn.query(`Select * from preciosmadera;`, function (err, result, fields) {
  //   if (err) {
  //     console.log('Error en la consulta a la bd'+ err)
  //   }
  //   //Enviar resultado en forma de JSON
  //   res.json(result);
  // });
})

router.post('/',function(req,res){
  let cliente = req.body
  console.log(preciomadera)

  dbConn.query(`Insert into preciosmadera SET medida=?, cliente=?, precio=?`,[preciomadera.medida, preciomadera.cliente, float(preciomadera.precio)], function (err, result) {
    if (err) {
      console.log('Error en el insert:'+ err)
      res.status(222).send('Error insert')
    }else{
      //Enviar resultado en forma de JSON
    res.send('Se ha insertado correctamente');
    }
      
  });

})

router.delete('/:medida/:cif',function(req,res){
  console.log(`Intentando borrar ${req.params.medida}-${req.params.cif}`)

  dbConn.query('DELETE FROM preciosmadera WHERE medida=? and cliente=?',[req.params.medida, req.params.cif], function (err, result) {
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
  dbConn.query('UPDATE preciosmadera SET precio=? WHERE medida=? and cliente=?', [preciomadera.precio, preciomadera.medida, preciomadera.cliente], function(err, result) {
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
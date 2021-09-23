const express = require('express');
const router = express.Router();
const mailer = require('../lib/mailer');

/* GET contacto page. */
router.get('/', function(req, res, next) {
  res.send('contacto');
});

router.post('/', function(req, res, next) {
  let email = req.body.email
  let asunto = req.body.asunto
  let mensaje = req.body.mensaje


  //enviar datos a correo

  let transporter = mailer.transporter;
  let mailOptions = {
    from: email, // non fai nada
    to: 'martinpose@hotmail.com', // list of receivers
    subject: asunto, // Subject line
    text: `De parte de ${email} \nEl mensaje:  ${mensaje}` 
  };

  console.log(`mensaje recido ${email} ${asunto} ${mensaje}`)

  transporter.sendMail(mailOptions, function (err, info) {
    if(err)
      console.log('error: '+err)
    else
      console.log(info);
      //mostrar mensaje éxito
      res.redirect('contacto/exito')
 });
});

router.get('/exito', function(req, res, next) {
  res.render('avisoRecibido')
});

module.exports = router;

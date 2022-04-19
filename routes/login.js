const express = require('express');
const seguridad = require('../lib/seguridad')
const router = express.Router();
const dbConn  = require('../lib/db')

//Si hacemos un get
router.post('/', function(req, res) {
    const user = req.body.name
    const password = req.body.password


});


//Si recibimos post

router.post('/', passport.authenticate('local.login',{

    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
   }));


  router.get('/profile', function(req, res) {
      res.send("Este es tu perfil");
  });
  module.exports = router
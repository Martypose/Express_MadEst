const express = require('express');
const seguridad = require('../lib/seguridad')
const router = express.Router();
const dbConn  = require('../lib/db')
const passport = require('passport');

//Si hacemos un get
router.get('/', function(req, res, next) {
    res.render('login');
});


//Si recibimos post

router.post('/', function(req, res) {

    let username = req.body.username
    let password = req.body.password

   passport.authenticate('local.login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
   });

   res.send('recibido');
  })


  router.get('/profile', function(req, res) {
      res.send("Este es tu perfil");
  });
  module.exports = router
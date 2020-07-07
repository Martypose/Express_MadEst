const express = require('express');
const seguridad = require('../lib/seguridad')
const router = express.Router();
var dbConn  = require('../lib/db')

//Si hacemos un get
router.get('/', function(req, res, next) {
    res.render('login');
});


//Si recibimos post

router.post('/', seguridad, function(req, res) {

    let username = req.body.username
    let password = req.body.password

    res.send(`El servidor recibe los datos: ${username} - ${password}`);
  })
  module.exports = router
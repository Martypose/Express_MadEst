var express = require('express');
var router = express.Router();

/* GET productos page. */
router.get('/', function(req, res, next) {
  res.render('productos');
});

module.exports = router;

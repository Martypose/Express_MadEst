var express = require('express');
var router = express.Router();

/* GET empresa page. */
router.get('/', function(req, res, next) {
  res.render('empresa');
});

module.exports = router;

var express = require('express');
var router = express.Router();

/* GET serrado page. */
router.get('/', function(req, res, next) {
  res.render('serrado');
});

module.exports = router;

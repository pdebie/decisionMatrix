var express = require('express');
var router = express.Router();
var _ = require('lodash');
var mmatrix = require('../models/mmatrix');


/* GET matrix listing. */
router.get('/', function(req, res, next) {
  res.json({ result: 'ok', error: "", matrix: mmatrix.listMatrix(req.app)});
  // res.json({ result: 'ok', error: "", matrix: matrix});
});

router.get('/:id', function(req, res, next) {
  res.json({ result: 'ok', error: "", matrix: mmatrix.getMatrix(req.params.id, req.app)});
});

router.post('/', function(req, res, next) {
  res.json(mmatrix.postMatrix(req.body, req.app));
});


module.exports = router;

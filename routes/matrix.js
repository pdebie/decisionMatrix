var express = require('express');
var router = express.Router();
var _ = require('lodash');
var mmatrix = require('../models/mmatrix');


/* GET matrix listing. */
router.get('/', function(req, res, next) {
  res.json({ result: 'ok', error: "", matrix: mmatrix.listMatrix()});
  // res.json({ result: 'ok', error: "", matrix: matrix});
});

router.get('/:id', function(req, res, next) {
  console.log(req.params.id);
  res.json({ result: 'ok', error: "", matrix: mmatrix.getMatrix(req.params.id)});
});

router.post('/', function(req, res, next) {
  console.log(req.body);
  var _result = {};
  _result.result = "";
  if (!_.isUndefined(req.body.action)) {
    if (req.body.action === "store"){
      _result = mmatrix.addMatrix(req.body.definition);
    }
    else {
      _result = mmatrix.searchMatrix(req.body.q);
    };
  }
  else {
    _result.result = "failed"
    _result.message = "action undefined";
  };
  res.json(_result);
});


module.exports = router;

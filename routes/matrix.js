var express = require('express');
var router = express.Router();
var _ = require('lodash');

var matrix = {
  items : [
//    {id: 1, k: "a", v:"11"},
//    {id: 2, k: "b", v:"22"}
  ],
  paths: [
//    {order: 1, path: [1, 2], result: "decimaux"},
//    {order: 2, path: [3, 5], result: "y"}
  
  ]
};

function findIndexOfKeyValue(kv) {
  var _result = -1;
  var z = {};
  z = _.findWhere(matrix.items, kv);
  if (!_.isUndefined(z)) {
    _result = z.id;
  };
  return _result;
};


function insertMatrixItem(obj) {
  var _id = -1;
  _id = findIndexOfKeyValue(obj);
  if (_id < 0) {
    var maxidobj = {};
    maxidobj = _.max(matrix.items, function(chr) {
      return chr.id;
    });
    var newItem = _.clone(obj);
    if (!_.isUndefined(maxidobj)) {
      _id = maxidobj.id + 1;
      newItem['id'] = _id;
    }
    else {
      _id = 0;
      newItem['id'] = 0;
    };
    matrix.items.push(newItem);
  };
  return _id;
};


function addMatrix(csvdef) {
  var newPath = {};
  newPath.order = 1;
  newPath.path = [];
  newPath.result = '';
  var rows = csvdef.split("\n");
  var _k = rows[0];
  var _v = rows[1];
  var ka = _k.split(";");
  var va = _v.split(";");
  var listObject = _.object(ka, va);
  _.each(listObject, function(v,k,i){
    if (k === 'result') {
      newPath.result = v;
    }
    else {
      var baba = {};
      baba.k = k;
      baba.v = v;

      newPath.path.push(insertMatrixItem(baba));
    };
  });
  matrix.paths.push(newPath);
};



/* GET matrix listing. */
router.get('/', function(req, res, next) {
  res.json({ result: 'ok', error: "", matrix: matrix});
});

router.get('/:id', function(req, res, next) {
  console.log(req.params.id);
  res.json({ result: 'ok', error: "", matrix: matrix});
});

router.post('/', function(req, res, next) {
  console.log(req.body);
  addMatrix(req.body.matrix.definition);
  res.json({ result: 'ok'});
});


module.exports = router;

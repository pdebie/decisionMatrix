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

/* ******************
    Create a Matrix
   ******************
 */
 
/*
  Insert a pair of kay value only if not exists
*/
function insertMatrixItem(obj) {
  var _id = -1;
  _id = findIndexOfKeyValue(obj);
  if (_id < 0) {
    var maxidobj = {};
    maxidobj = _.max(matrix.items, function(chr) {
      return chr.id;
    });
    var newItem = _.clone(obj);
    if (!_.isUndefined(maxidobj.id)) {
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

/*
  Add a new row of many pair of keys, values and its corresponding path
*/
function addRowMatrix(ka, va) {
  var newPath = {};
  newPath.order = 1;
  newPath.path = [];
  newPath.result = '';
  
  var listObject = _.object(ka, va);
  _.each(listObject, function(v, k, i){
    if (k === 'result') {
      newPath.result = v;
    }
    else {
      var pair = {};
      pair.k = k;
      pair.v = v;

      newPath.path.push(insertMatrixItem(pair));
    };
  });
  matrix.paths.push(newPath);
};

/*
  Add or update a complete Matrix of many rows
  First row header for the keys
  Second and followers rows of values
*/
function addMatrix(csvdef) {
  var _result = {};
  _result.result = "success";
  _result.message = "";
  
  var rows = csvdef.split("\n");
  if (rows.length < 2) {
    _result.result = "failed";
    _result.message = "Expected at least two lines, one for keys, one or more for values";
    
  }
  else {
    var _k = _.first(rows);
    var _ka = _k.split(";");
    _.each(_.rest(rows), function(aRow) {
      var _va = aRow.split(";");
      addRowMatrix(_ka, _va);
      
    });
  };
  return _result;
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

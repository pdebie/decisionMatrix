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

function searchPath(thisPath) {
  var diffLeft = [];
  var diffRight = [];
  var _result = {};
  _result.found = false;
  _result.value = {};
  _.each(matrix.paths, function(p) {
    if (!_result.found) {
      diffLeft = _.difference(thisPath, p.path);
      diffRight = _.difference(p.path, thisPath);
      if (diffLeft.length == 0 && diffRight.length == 0) {
        _result.found = true;
        _result.value = p.result;
        console.log(" ----  And the winner is: ", _result);
      };
    };
  });
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
    /* before insert new item find last id */
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
  
  var zz = searchPath(newPath.path);
  /* add only if not exists */
  if (!zz.found) {
    matrix.paths.push(newPath);
  };
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

/* ******************
    Search in a Matrix
   ******************
 */

function buildSearchPath(_si) {
  var _pathForIn = [];
  var idx = -1;
  var result = true;

  _.each(_si, function(i) {
  	idx = findIndexOfKeyValue(i);
    if (idx < 0) {
      result = false;
    }
    else {
  	  _pathForIn.push(idx);
    };
  });
  _pathForIn = _.uniq(_pathForIn, true);
  
  /* if one of the items is not found path is rejected */
  if (!result) {
    _pathForIn = [];
  };
  return _pathForIn;
};


function buildSearchItem(query) {
  var searchItem = [];
  _.forIn(query, function(v, k){
    var one_i = {};
    one_i.k = k;
    one_i.v = v;
    searchItem.push(one_i);
  });
  return searchItem;
};

function searchMatrix(query) {
  var si = []; /* search item */
  var sp = []; /* search path */
  si = buildSearchItem(query);
  console.log(si);
  sp = buildSearchPath(si);
  console.log(sp);
  return searchPath(sp);
};

/* ******************
    Routing 
   ******************
 */

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
  var _result = {};
  _result.result = "";
  if (!_.isUndefined(req.body.action)) {
    if (req.body.action === "store"){
      _result = addMatrix(req.body.definition);
    }
    else {
      _result = searchMatrix(req.body.q);
    };
  }
  else {
    _result.result = "failed"
    _result.message = "action undefined";
  };
  res.json(_result);
});


module.exports = router;

var _ = require('lodash');
var jsonfile = require('jsonfile');
var util = require('util');

var mmatrix = (function () {

  var filematrix = '../data.json';
  
  var matrixloaded = false;
  /*
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
  */
  
  var loadMatrix = function(apploc) {
    apploc.matrixes = {};
    console.log('loadMatrix');
    var tempMatrix = {};
    try {
      tempMatrix = jsonfile.readFileSync(filematrix);
      // console.dir(tempMatrix);
    }
      catch (e) {
    };
    console.dir(tempMatrix);
    if (!_.isEmpty(tempMatrix)) {
      console.log('Init matrix', tempMatrix);
      apploc.matrixes = tempMatrix;
    };
  };
  
  var listMatrix = function(myapp) {
    // console.log(_bibi.locals.fifi);
    return myapp.locals.matrixes;
  };

  var getMatrix = function(_id, myapp) {
    return myapp.locals.matrixes;
  };
  
  var findIndexOfKeyValue = function (kv, myapp) {
    var _result = -1;
    var z = {};
    z = _.findWhere(myapp.locals.matrixes.items, kv);
    if (!_.isUndefined(z)) {
      _result = z.id;
    };
    return _result;
  };
  
  var searchPath = function (thisPath, myapp) {
    var diffLeft = [];
    var diffRight = [];
    var _result = {};
    _result.found = false;
    _result.value = {};
    _.each(myapp.locals.matrixes.paths, function(p) {
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
  
  
 /* *********************************
  * Create Matrix functions
  * *********************************
  */
   
   
  /*
   * Insert a pair of kay value only if not exists
   */
  var insertMatrixItem = function (obj, myapp) {
    var _id = -1;
    
    if (_.isUndefined(myapp.locals.matrixes.items)) {
      console.log('no items');
      myapp.locals.matrixes.items = [];
    };
    
    _id = findIndexOfKeyValue(obj, myapp);
    if (_id < 0) {
      /* before insert new item find last id */
      var maxidobj = {};
      maxidobj = _.max(myapp.locals.matrixes.items, function(chr) {
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
      myapp.locals.matrixes.items.push(newItem);
    };
    return _id;
  };
  
 /*
  * Add a new row of many pair of keys, values and its corresponding path
  *
  */
  var addRowMatrix = function (ka, va, myapp) {
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
  
        newPath.path.push(insertMatrixItem(pair, myapp));
      };
    });
    
    var zz = searchPath(newPath.path, myapp);
    /* add only if not exists */
    if (!zz.found) {
      if (_.isUndefined(myapp.locals.matrixes.paths)) {
        console.log('no path');
        myapp.locals.matrixes.paths = [];
      };
      myapp.locals.matrixes.paths.push(newPath);
    };
  };
  
  /* *********************************************************
   * Add or update a complete Matrix of many rows
   * First row header for the keys
   * Second and followers rows of values
   * *********************************************************
   */
  var addMatrix = function(csvdef, myapp) {
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
        addRowMatrix(_ka, _va, myapp);
        
      });
    };
    try {
      jsonfile.writeFile(filematrix, myapp.locals.matrixes, function (err) {
        console.error(err)
      });      
      console.log('saved');
    }
      catch (e) {
    };    
    return _result;
  };
  
  /* ******************
   *  Search functions
   * ******************
   */
  
  var buildSearchPath = function (_si, myapp) {
    var _pathForIn = [];
    var idx = -1;
    var result = true;
  
    _.each(_si, function(i) {
    	idx = findIndexOfKeyValue(i, myapp);
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
  
  
  var buildSearchItem = function (query) {
    var searchItem = [];
    _.forIn(query, function(v, k){
      var one_i = {};
      one_i.k = k;
      one_i.v = v;
      searchItem.push(one_i);
    });
    return searchItem;
  };
  
  
  /* ******************
   * Search matrix
   * ******************
   */
  var searchMatrix = function(query, myapp) {
    var si = []; /* search item */
    var sp = []; /* search path */
    si = buildSearchItem(query);
    sp = buildSearchPath(si, myapp);
    return searchPath(sp, myapp);
  };
    
    

  return {
    searchMatrix: searchMatrix,
    addMatrix: addMatrix,
    getMatrix: getMatrix,
    listMatrix: listMatrix,
    loadMatrix: loadMatrix
  };

})();



module.exports = mmatrix;
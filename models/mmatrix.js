var _ = require('lodash');
var jsonfile = require('jsonfile');
var util = require('util');

var mmatrix = (function () {

  var filematrix = '../data.json';
  
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
    apploc.matrixes = [];
    console.log('loadMatrix');
    var tempMatrix = [];
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
    return _.map(myapp.locals.matrixes, 'name');
  };

  var getMatrix = function(_id, myapp) {
    var m = _.find(myapp.locals.matrixes, {name: _id});
    if (_.isUndefined(m)) {
      return {};
    }
    else {
      return m;
    };
  };
  
  var findIndexOfKeyValue = function (kv, mymatrix) {
    var _result = -1;
    var z = {};
    z = _.findWhere(mymatrix.items, kv);
    if (!_.isUndefined(z)) {
      _result = z.id;
    };
    return _result;
  };
  
  var searchPath = function (thisPath, mymatrix) {
    var diffLeft = [];
    var diffRight = [];
    var _result = {};
    _result.found = false;
    _result.value = {};
    _.each(mymatrix.paths, function(p) {
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
  var insertMatrixItem = function (obj, mymatrix) {
    var _id = -1;
    
    if (_.isUndefined(mymatrix.items)) {
      console.log('no items');
      mymatrix.items = [];
    };
    
    _id = findIndexOfKeyValue(obj, mymatrix);
    if (_id < 0) {
      /* before insert new item find last id */
      var maxidobj = {};
      maxidobj = _.max(mymatrix.items, function(chr) {
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
      mymatrix.items.push(newItem);
    };
    return _id;
  };
  
 /*
  * Add a new row of many pair of keys, values and its corresponding path
  *
  */
  var addRowMatrix = function (ka, va, mymatrix) {
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
  
        newPath.path.push(insertMatrixItem(pair, mymatrix));
      };
    });
    
    var zz = searchPath(newPath.path, mymatrix);
    /* add only if not exists */
    if (!zz.found) {
      if (_.isUndefined(mymatrix.paths)) {
        console.log('no path');
        mymatrix.paths = [];
      };
      mymatrix.paths.push(newPath);
    };
  };
  
  /* *********************************************************
   * Add or update a complete Matrix of many rows
   * First row header for the keys
   * Second and followers rows of values
   * *********************************************************
   */
  var addMatrix = function(csvdef, matrixname, myapp) {
    var _result = {};
    _result.result = "success";
    _result.message = "";
    
    var rows = csvdef.split("\n");
    if (rows.length < 2) {
      _result.result = "failed";
      _result.message = "Expected at least two lines, one for keys, one or more for values";
      
    }
    else {
      var currentMatrix = {};
      currentMatrix = getMatrix(matrixname, myapp);
      if (_.isEmpty(currentMatrix)) {
        currentMatrix.name = matrixname;
      };
      
      var _k = _.first(rows);
      var _ka = _k.split(";");
      _.each(_.rest(rows), function(aRow) {
        var _va = aRow.split(";");
        addRowMatrix(_ka, _va, currentMatrix);
        
      });
      
      console.log('currentMatrix');
      console.dir(currentMatrix);
      var reworkMatrix = [];
      reworkMatrix = _.reject(myapp.locals.matrixes, { name: matrixname});
      if (_.isUndefined(reworkMatrix)) {
        reworkMatrix = [];
      };
      
      console.log('reworkMatrix');
      console.dir(reworkMatrix);
      reworkMatrix.push(currentMatrix);
      myapp.locals.matrixes = reworkMatrix;
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
  
  var buildSearchPath = function (_si, currentMatrix) {
    var _pathForIn = [];
    var idx = -1;
    var result = true;
  
    _.each(_si, function(i) {
    	idx = findIndexOfKeyValue(i, currentMatrix);
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
  var searchMatrix = function(query, matrixname, myapp) {
    var si = []; /* search item */
    var sp = []; /* search path */
    var currentMatrix = {};
    currentMatrix = getMatrix(matrixname, myapp);
    
    si = buildSearchItem(query);
    sp = buildSearchPath(si, currentMatrix);
    return searchPath(sp, currentMatrix);
  };
  
  var postMatrix = function(_body, myapp) {
    var _result = {};
    _result.result = "";
    if ((_.has(_body, 'action'))
        && (_.has(_body, 'name'))
        && (_.has(_body, 'definition') || _.has(_body, 'q'))) {
      if (_body.action === "store") {
        _result = addMatrix(_body.definition, _body.name, myapp);
      }
      else {
        _result = searchMatrix(_body.q, _body.name, myapp);
      };
    }
    else {
      _result.result = "failed"
      _result.message = "body malformed";
    };
    return _result;
  };

  return {
    postMatrix: postMatrix,
    getMatrix: getMatrix,
    listMatrix: listMatrix,
    loadMatrix: loadMatrix
  };

})();



module.exports = mmatrix;
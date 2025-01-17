"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createIndexClass = void 0;
var _is = require("../../utils/is.js");
var _object = require("../../utils/object.js");
var _number = require("../../utils/number.js");
var _factory = require("../../utils/factory.js");
var name = 'Index';
var dependencies = ['ImmutableDenseMatrix', 'getMatrixDataType'];
var createIndexClass = /* #__PURE__ */(0, _factory.factory)(name, dependencies, function (_ref) {
  var ImmutableDenseMatrix = _ref.ImmutableDenseMatrix,
    getMatrixDataType = _ref.getMatrixDataType;
  /**
   * Create an index. An Index can store ranges and sets for multiple dimensions.
   * Matrix.get, Matrix.set, and math.subset accept an Index as input.
   *
   * Usage:
   *     const index = new Index(range1, range2, matrix1, array1, ...)
   *
   * Where each parameter can be any of:
   *     A number
   *     A string (containing a name of an object property)
   *     An instance of Range
   *     An Array with the Set values
   *     An Array with Booleans
   *     A Matrix with the Set values
   *     A Matrix with Booleans
   *
   * The parameters start, end, and step must be integer numbers.
   *
   * @class Index
   * @Constructor Index
   * @param {...*} ranges
   */
  function Index(ranges) {
    if (!(this instanceof Index)) {
      throw new SyntaxError('Constructor must be called with the new operator');
    }
    this._dimensions = [];
    this._sourceSize = [];
    this._isScalar = true;
    for (var i = 0, ii = arguments.length; i < ii; i++) {
      var arg = arguments[i];
      var argIsArray = (0, _is.isArray)(arg);
      var argIsMatrix = (0, _is.isMatrix)(arg);
      var sourceSize = null;
      if ((0, _is.isRange)(arg)) {
        this._dimensions.push(arg);
        this._isScalar = false;
      } else if (argIsArray || argIsMatrix) {
        // create matrix
        var m = void 0;
        if (getMatrixDataType(arg) === 'boolean') {
          if (argIsArray) m = _createImmutableMatrix(_booleansArrayToNumbersForIndex(arg).valueOf());
          if (argIsMatrix) m = _createImmutableMatrix(_booleansArrayToNumbersForIndex(arg._data).valueOf());
          sourceSize = arg.valueOf().length;
        } else {
          m = _createImmutableMatrix(arg.valueOf());
        }
        this._dimensions.push(m);
        // size
        var size = m.size();
        // scalar
        if (size.length !== 1 || size[0] !== 1 || sourceSize !== null) {
          this._isScalar = false;
        }
      } else if (typeof arg === 'number') {
        this._dimensions.push(_createImmutableMatrix([arg]));
      } else if (typeof arg === 'string') {
        // object property (arguments.count should be 1)
        this._dimensions.push(arg);
      } else {
        throw new TypeError('Dimension must be an Array, Matrix, number, string, or Range');
      }
      this._sourceSize.push(sourceSize);
      // TODO: implement support for wildcard '*'
    }
  }

  /**
   * Attach type information
   */
  Index.prototype.type = 'Index';
  Index.prototype.isIndex = true;
  function _createImmutableMatrix(arg) {
    // loop array elements
    for (var i = 0, l = arg.length; i < l; i++) {
      if (typeof arg[i] !== 'number' || !(0, _number.isInteger)(arg[i])) {
        throw new TypeError('Index parameters must be positive integer numbers');
      }
    }
    // create matrix
    return new ImmutableDenseMatrix(arg);
  }

  /**
   * Create a clone of the index
   * @memberof Index
   * @return {Index} clone
   */
  Index.prototype.clone = function () {
    var index = new Index();
    index._dimensions = (0, _object.clone)(this._dimensions);
    index._isScalar = this._isScalar;
    index._sourceSize = this._sourceSize;
    return index;
  };

  /**
   * Create an index from an array with ranges/numbers
   * @memberof Index
   * @param {Array.<Array | number>} ranges
   * @return {Index} index
   * @private
   */
  Index.create = function (ranges) {
    var index = new Index();
    Index.apply(index, ranges);
    return index;
  };

  /**
   * Retrieve the size of the index, the number of elements for each dimension.
   * @memberof Index
   * @returns {number[]} size
   */
  Index.prototype.size = function () {
    var size = [];
    for (var i = 0, ii = this._dimensions.length; i < ii; i++) {
      var d = this._dimensions[i];
      size[i] = typeof d === 'string' ? 1 : d.size()[0];
    }
    return size;
  };

  /**
   * Get the maximum value for each of the indexes ranges.
   * @memberof Index
   * @returns {number[]} max
   */
  Index.prototype.max = function () {
    var values = [];
    for (var i = 0, ii = this._dimensions.length; i < ii; i++) {
      var range = this._dimensions[i];
      values[i] = typeof range === 'string' ? range : range.max();
    }
    return values;
  };

  /**
   * Get the minimum value for each of the indexes ranges.
   * @memberof Index
   * @returns {number[]} min
   */
  Index.prototype.min = function () {
    var values = [];
    for (var i = 0, ii = this._dimensions.length; i < ii; i++) {
      var range = this._dimensions[i];
      values[i] = typeof range === 'string' ? range : range.min();
    }
    return values;
  };

  /**
   * Loop over each of the ranges of the index
   * @memberof Index
   * @param {Function} callback   Called for each range with a Range as first
   *                              argument, the dimension as second, and the
   *                              index object as third.
   */
  Index.prototype.forEach = function (callback) {
    for (var i = 0, ii = this._dimensions.length; i < ii; i++) {
      callback(this._dimensions[i], i, this);
    }
  };

  /**
   * Retrieve the dimension for the given index
   * @memberof Index
   * @param {Number} dim                  Number of the dimension
   * @returns {Range | null} range
   */
  Index.prototype.dimension = function (dim) {
    return this._dimensions[dim] || null;
  };

  /**
   * Test whether this index contains an object property
   * @returns {boolean} Returns true if the index is an object property
   */
  Index.prototype.isObjectProperty = function () {
    return this._dimensions.length === 1 && typeof this._dimensions[0] === 'string';
  };

  /**
   * Returns the object property name when the Index holds a single object property,
   * else returns null
   * @returns {string | null}
   */
  Index.prototype.getObjectProperty = function () {
    return this.isObjectProperty() ? this._dimensions[0] : null;
  };

  /**
   * Test whether this index contains only a single value.
   *
   * This is the case when the index is created with only scalar values as ranges,
   * not for ranges resolving into a single value.
   * @memberof Index
   * @return {boolean} isScalar
   */
  Index.prototype.isScalar = function () {
    return this._isScalar;
  };

  /**
   * Expand the Index into an array.
   * For example new Index([0,3], [2,7]) returns [[0,1,2], [2,3,4,5,6]]
   * @memberof Index
   * @returns {Array} array
   */
  Index.prototype.toArray = function () {
    var array = [];
    for (var i = 0, ii = this._dimensions.length; i < ii; i++) {
      var dimension = this._dimensions[i];
      array.push(typeof dimension === 'string' ? dimension : dimension.toArray());
    }
    return array;
  };

  /**
   * Get the primitive value of the Index, a two dimensional array.
   * Equivalent to Index.toArray().
   * @memberof Index
   * @returns {Array} array
   */
  Index.prototype.valueOf = Index.prototype.toArray;

  /**
   * Get the string representation of the index, for example '[2:6]' or '[0:2:10, 4:7, [1,2,3]]'
   * @memberof Index
   * @returns {String} str
   */
  Index.prototype.toString = function () {
    var strings = [];
    for (var i = 0, ii = this._dimensions.length; i < ii; i++) {
      var dimension = this._dimensions[i];
      if (typeof dimension === 'string') {
        strings.push(JSON.stringify(dimension));
      } else {
        strings.push(dimension.toString());
      }
    }
    return '[' + strings.join(', ') + ']';
  };

  /**
   * Get a JSON representation of the Index
   * @memberof Index
   * @returns {Object} Returns a JSON object structured as:
   *                   `{"mathjs": "Index", "ranges": [{"mathjs": "Range", start: 0, end: 10, step:1}, ...]}`
   */
  Index.prototype.toJSON = function () {
    return {
      mathjs: 'Index',
      dimensions: this._dimensions
    };
  };

  /**
   * Instantiate an Index from a JSON object
   * @memberof Index
   * @param {Object} json A JSON object structured as:
   *                     `{"mathjs": "Index", "dimensions": [{"mathjs": "Range", start: 0, end: 10, step:1}, ...]}`
   * @return {Index}
   */
  Index.fromJSON = function (json) {
    return Index.create(json.dimensions);
  };
  return Index;
}, {
  isClass: true
});

/**
 * Receives an array of booleans and returns an array of Numbers for Index
 * @param {Array} booleanArrayIndex An array of booleans
 * @return {Array} A set of numbers ready for index
 */
exports.createIndexClass = createIndexClass;
function _booleansArrayToNumbersForIndex(booleanArrayIndex) {
  // gets an array of booleans and returns an array of numbers
  var indexOfNumbers = [];
  booleanArrayIndex.forEach(function (bool, idx) {
    if (bool) {
      indexOfNumbers.push(idx);
    }
  });
  return indexOfNumbers;
}
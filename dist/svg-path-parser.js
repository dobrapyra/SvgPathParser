/*!
 * SVG path parser
 * version: 2018.05.10
 * author: dobrapyra
 * url: https://github.com/dobrapyra/SvgPathParser
 */
/**
 * Object.keys from EasyPure by dobrapyra
 * date: 2018.05.10
 * url: https://github.com/dobrapyra/EasyPure/blob/master/src/polyfills/Object/keys.js
 */
if( !Object.keys ) {
  Object.keys = function( obj ) {

    if( obj !== Object( obj ) ) throw new TypeError( 'Object.keys called on a non-object' );

    var keysArr = [], key;

    for( key in obj ) {
      if( obj.hasOwnProperty( key ) ) keysArr.push( key );
    }

    return keysArr;
  };
}
/**
 * Object.assign from EasyPure by dobrapyra
 * date: 2018.05.10
 * url: https://github.com/dobrapyra/EasyPure/blob/master/src/polyfills/Object/assign.js
 */
if( !Object.assign ) {
  Object.assign = function( obj/*, srcObjs*/ ) {

    if( obj !== Object( obj ) ) throw new TypeError( 'Object.assign called on a non-object' );

    var resultObj, tmpSource, keysArr, i, l, j, k, tmpKey;

    resultObj = Object( obj );

    l = arguments.length;
    for( i = 1; i < l; i++ ) {
      tmpSource = arguments[ i ];

      if( !tmpSource ) continue;

      keysArr = Object.keys( tmpSource );

      k = keysArr.length;
      for( j = 0; j < k; j++ ) {
        tmpKey = keysArr[ j ];

        resultObj[ tmpKey ] = tmpSource[ tmpKey ];
      }
    }

    return resultObj;
  };
}
var SvgPathParser = function(props){ this.init(props); };
Object.assign(SvgPathParser.prototype, {

  init: function(props) {
    
  },

  /**
   * parsePath - parse path element
   * @param {object} pathEl - path element
   */
  parsePath: function(pathEl) {
    if( pathEl.tagName && pathEl.tagName === 'path' ) {
      return this.parse(pathEl.getAttribute('d'));
    }

    console.warn('Wrong input, expected path element.');

    this.pointsArr = [];

    return this;
  },

  /**
   * parse - parse d parameter
   * @param {string} dString - d attribute of the path
   */
  parse: function(dString) {
    var parts = dString.split(/\s*z\s*/);
    console.log( parts );
    for(var c, i = 0, l = dString.length; i < l; i++) {
      c = dString[i];

      dString
    }


    this.pointsArr = [];

    return this;
  },

  /**
   * result - get the result points array
   */
  result: function() {
    return this.pointsArr;
  },

  /**
   * round - round all points coordinate to precision
   * @param {number} p - precision
   */
  round: function(p) {
    var roundVal = this._roundVal;

    this.pointsArr = this.pointsArr.map(function(point) {
      return Object.assign(point, {
        x: roundVal(x, p),
        y: roundVal(y, p)
      });
    });

    return this;
  },

  /**
   * _roundVal - round single value to precision
   * @param {number} val - value
   * @param {number} p - precision
   */
  _roundVal: function(val, p) {
    return Math.round(val * p) / p;
  }

});
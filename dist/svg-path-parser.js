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
    this.precision = props.precision || 1e5;
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
    var groupArr = this._getCmdGroupArr(dString);

    var cmdArr = this._getCmdArr(groupArr);

    var cmdArrWithXY = this._getCmdBeginEndXY(cmdArr);

    this.cmdArr = cmdArrWithXY;
    this.pointsArr = this._getXYArr(cmdArrWithXY);

    return this;
  },

  /**
   * _getCmdGroupArr - return cmd group array
   * @param {string} dString - d attribute of the path
   */
  _getCmdGroupArr: function(dString) {
    return dString
      // initial prepare
      .replace( /\s*\,\s*/g, ' ' )
      .replace( /\s*\-\s*/g, ' -' )
      // cmd group string array
      .replace( /m|l|h|v|z|c|s|q|t|a/gi, function(c) {
        return '|' + c;
      } )
      .split(/\s*\|\s*/)
      // .split('|')
      // .map( function(group) {
      //   return group.trim();
      // } )
      .filter( function(group) {
        return group !== '';
      } )
      // cmd group array
      .map( function(group) {
        return {
          cmd: group
            .slice(0, 1),
          params: group
            .slice(1)
            .split(/\s*\ \s*/)
            // .split(' ')
            // .map( function(param) {
            //   return param.trim();
            // } )
            .filter( function(param) {
              return param !== '';
            } )
            .map( function(param) {
              return parseFloat(param);
            } )
        };
      } );
  },

  /**
   * _getCmdArr - return cmd array
   * @param {array} groupArr - cmd group array
   */
  _getCmdArr: function(groupArr) {
    var cmdArr = [];
    var paramsL, paramsC;

    groupArr.map( function(group) {
      paramsL = group.params.length;
      paramsC = 0;

      switch(group.cmd) {
        default:
          console.warn( 'Unexpected command ' + group.cmd );
          break;

        case 'm':
        case 'l':
          cmdArr.push({
            cmd: group.cmd,
            params: group.params.slice(paramsC, paramsC + 2)
          });
          paramsC += 2;
          while(paramsC < paramsL) {
            cmdArr.push({
              cmd: 'l',
              params: group.params.slice(paramsC, paramsC + 2)
            });
            paramsC += 2;
          }
          break;

        case 'M':
        case 'L':
          cmdArr.push({
            cmd: group.cmd,
            params: group.params.slice(paramsC, paramsC + 2)
          });
          paramsC += 2;
          while(paramsC < paramsL) {
            cmdArr.push({
              cmd: 'L',
              params: group.params.slice(paramsC, paramsC + 2)
            });
            paramsC += 2;
          }
          break;

        case 'h':
        case 'v':
        case 'H':
        case 'V':
          while(paramsC < paramsL) {
            cmdArr.push({
              cmd: group.cmd,
              params: group.params.slice(paramsC, paramsC + 1)
            });
            paramsC += 1;
          }
          break;

        case 'z':
          cmdArr.push({
            cmd: group.cmd,
            params: []
          });
          while(paramsC < paramsL) {
            cmdArr.push({
              cmd: 'l',
              params: group.params.slice(paramsC, paramsC + 2)
            });
            paramsC += 2;
          }
          break;

        case 'Z':
          cmdArr.push({
            cmd: group.cmd,
            params: []
          });
          while(paramsC < paramsL) {
            cmdArr.push({
              cmd: 'L',
              params: group.params.slice(paramsC, paramsC + 2)
            });
            paramsC += 2;
          }
          break;

        case 'c':
        case 'C':
          while(paramsC < paramsL) {
            cmdArr.push({
              cmd: group.cmd,
              params: group.params.slice(paramsC, paramsC + 6)
            });
            paramsC += 6;
          }
          break;

        case 's':
        case 'S':
        case 'q':
        case 'Q':
          while(paramsC < paramsL) {
            cmdArr.push({
              cmd: group.cmd,
              params: group.params.slice(paramsC, paramsC + 4)
            });
            paramsC += 4;
          }
          break;

        case 't':
        case 'T':
          while(paramsC < paramsL) {
            cmdArr.push({
              cmd: group.cmd,
              params: group.params.slice(paramsC, paramsC + 2)
            });
            paramsC += 2;
          }
          break;

        case 'a':
        case 'A':
          while(paramsC < paramsL) {
            cmdArr.push({
              cmd: group.cmd,
              params: group.params.slice(paramsC, paramsC + 7)
            });
            paramsC += 7;
          }
          break;

      }

      return group;
    } );

    return cmdArr;
  },

  /**
   * _getCmdBeginEndXY - return cmd array with begin and end xy
   * @param {array} cmdArr - cmd array
   */
  _getCmdBeginEndXY: function(cmdArr) {
    var roundVal = this._roundVal,
      p = this.precision;
    var lastCmd = null, pathBeginXY = [0, 0],
      beginXY, endXY, lastXY = [0, 0];

    return cmdArr.map( function(cmdObj) {
      beginXY = [
        lastXY[0],
        lastXY[1]
      ];

      switch(cmdObj.cmd) {
        default:
          console.warn( 'Unexpected command ' + cmdObj.cmd );
          break;

        // moveTo relative
        case 'm':
          endXY = [
            roundVal( beginXY[0] + cmdObj.params[0], p ),
            roundVal( beginXY[1] + cmdObj.params[1], p )
          ];
          if(
            lastCmd === 'z' || lastCmd === 'Z' ||
            lastCmd === 'm' || lastCmd === 'M' ||
            lastCmd === null
          ){
            pathBeginXY = endXY;
          }
          break;

        // moveTo absolute
        case 'M':
          endXY = [
            cmdObj.params[0],
            cmdObj.params[1]
          ];
          if(
            lastCmd === 'Z' || lastCmd === 'z' ||
            lastCmd === 'M' || lastCmd === 'm' ||
            lastCmd === null
          ){
            pathBeginXY = endXY;
          }
          break;

        // lineTo relative
        case 'l':
          endXY = [
            roundVal( beginXY[0] + cmdObj.params[0], p ),
            roundVal( beginXY[1] + cmdObj.params[1], p )
          ];
          break;

        // lineTo absolute
        case 'L':
          endXY = [
            cmdObj.params[0],
            cmdObj.params[1]
          ];
          break;

        // horizontal line relative
        case 'h':
          endXY = [
            roundVal( beginXY[0] + cmdObj.params[0], p ),
            beginXY[1]
          ];
          break;

        // horizontal line absolute
        case 'H':
          endXY = [
            cmdObj.params[0],
            beginXY[1]
          ];
          break;

        // vertical line relative
        case 'v':
          endXY = [
            beginXY[0],
            roundVal( beginXY[1] + cmdObj.params[0], p )
          ];
          break;

        // vertical line absolute
        case 'V':
          endXY = [
            beginXY[0],
            cmdObj.params[0]
          ];
          break;

        // close path
        case 'z':
        case 'Z':
          endXY = [
            pathBeginXY[0],
            pathBeginXY[1]
          ];
          break;

        // cubic bezier curve relative
        case 'c':
          endXY = [
            roundVal( beginXY[0] + cmdObj.params[4], p ),
            roundVal( beginXY[1] + cmdObj.params[5], p )
          ];
          break;

        // cubic bezier curve absolute
        case 'C':
          endXY = [
            cmdObj.params[4],
            cmdObj.params[5]
          ];
          break;

        // shorthand cubic bezier curve relative
        case 's':
          endXY = [
            roundVal( beginXY[0] + cmdObj.params[2], p ),
            roundVal( beginXY[1] + cmdObj.params[3], p )
          ];
          break;

        // shorthand cubic bezier curve absolute
        case 'S':
          endXY = [
            cmdObj.params[2],
            cmdObj.params[3]
          ];
          break;

        // quadratic bezier curve relative
        case 'q':
          endXY = [
            roundVal( beginXY[0] + cmdObj.params[2], p ),
            roundVal( beginXY[1] + cmdObj.params[3], p )
          ];
          break;

        // quadratic bezier curve absolute
        case 'Q':
          endXY = [
            cmdObj.params[2],
            cmdObj.params[3]
          ];
          break;

        // shorthand quadratic bezier curve relative
        case 'q':
          endXY = [
            roundVal( beginXY[0] + cmdObj.params[0], p ),
            roundVal( beginXY[1] + cmdObj.params[1], p )
          ];
          break;

        // shorthand quadratic bezier curve absolute
        case 'Q':
          endXY = [
            cmdObj.params[0],
            cmdObj.params[1]
          ];
          break;

        // elipse relative
        case 'a':
          endXY = [
            roundVal( beginXY[0] + cmdObj.params[5], p ),
            roundVal( beginXY[1] + cmdObj.params[6], p )
          ];
          break;

        // elipse absolute
        case 'A':
          endXY = [
            cmdObj.params[5],
            cmdObj.params[6]
          ];
          break;
      }

      lastCmd = cmdObj.cmd;
      lastXY = endXY;
      return Object.assign( cmdObj, {
        xy: {
          begin: beginXY,
          end: endXY
        }
      } );
    } );

    return cmdArr;
  },

  /**
   * _getXYArr - return array of xy array (for each subpath)
   * @param {array} cmdArr - cmd array with xy info
   */
  _getXYArr: function(cmdArr) {
    var subpathArr = [];
    var subpathC = 0;
    var cmdMax = cmdArr.length - 1;
    var cmdC = 0;
    var lastCmd = null;

    subpathArr[subpathC] = [];
    cmdArr.map( function(cmdObj) {
      if( cmdObj.cmd === 'm' || cmdObj.cmd === 'M' && (
        lastCmd === 'm' || lastCmd === 'M' ||
        lastCmd === 'z' || lastCmd === 'Z'
      ) ) {
        subpathArr[subpathC].splice(-1);
      }
      if( cmdObj.cmd === 'z' || cmdObj.cmd === 'Z' ) {
        if( cmdC === cmdMax ) return cmdObj; // skip last z or Z command
        subpathC++;
        subpathArr[subpathC] = [];
      }
      subpathArr[subpathC].push( cmdObj.xy.end );
      cmdC++;
      lastCmd = cmdObj.cmd;
      return cmdObj;
    } );

    return subpathArr;
  },

  /**
   * result - get the result points array
   */
  result: function() {
    return {
      commands: this.cmdArr,
      points: this.pointsArr
    };
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
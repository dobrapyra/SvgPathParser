var SvgPathParser = function(props){ this.init(props); };
Object.assign(SvgPathParser.prototype, {

  init: function(props) {
    this.precision = props.precision || 100000;
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

    this.pointsArr = cmdArrWithXY;

    // this.pointsArr = [];

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
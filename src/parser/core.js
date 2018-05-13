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
    var groupArr = dString
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

    var cmdArr = [];
    var paramsL, paramsC;
    groupArr.map( function(group) {
      paramsL = group.params.length;
      paramsC = 0;
      switch(group.cmd) {
        default:
          console.warn('Unexpected command');
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

      }
    } );
    // console.log( cmdArr );

    this.pointsArr = cmdArr;

    // this.pointsArr = [];

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
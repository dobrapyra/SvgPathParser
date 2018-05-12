let gulp = require( 'gulp' ),
  concat = require( 'gulp-concat' ),
  rename = require( 'gulp-rename' ),
  stripdebug = require( 'gulp-strip-debug' ),
  uglify = require( 'gulp-uglify' );

gulp.task( 'buildES5', () => {
  return gulp
    .src( [
      './src/parser/info.js',
      './src/vendors/polyfills/Object/keys.js',
      './src/vendors/polyfills/Object/assign.js',
      './src/parser/core.js'
    ] )
    .pipe( concat( 'svg-path-parser.js' ) )
    .pipe( gulp.dest( './dist' ) )
    .pipe( rename( 'svg-path-parser.min.js' ) )
    .pipe( stripdebug() )
    .pipe( uglify( {
      output: {
        comments: `/^!/`
      }
    } ) )
    .pipe( gulp.dest( './dist' ) );
} );

// default tasks
gulp.task( 'default', [ 'buildES5' ] );
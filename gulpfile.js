/* global require */

'use strict';


// require modules
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const browserSync = require('browser-sync').create();

// plugins prefixed by 'gulp-' will be loaded automatically
// file-related
const runSequence = require('run-sequence');
// (s)css
const pxtorem = require('postcss-pxtorem');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');


//
function _sassLint() {
  return gulp
    .src(['src/sass/**/*.scss'])
    .pipe($.changed('src/sass/**/*.scss'))
    .pipe($.sassLint({
      options: {
        formatter: 'stylish'
      },
      configFile: '.sass-lint.yml'
    }))
    .pipe($.sassLint.format());
}


//
gulp.task('default', ['serve']);


//
gulp.task('test', ['js:lint'], () => _sassLint().pipe($.sassLint.failOnError()));


// Static Server + watching scss files
gulp.task('serve', ['dev:build'], () => {
  // use proxy to work in a theme
  browserSync.init({
    server: {
      baseDir: "./"
    },
    open: false,
    notify: false
  });

  gulp.watch('src/sass/**/*.scss', ['css']);
  // gulp.watch('src/js/**/*.js', ['js']);

  gulp
    .watch(['src/js/**/*.js'], ['js'])
    .on('change', browserSync.reload);

  gulp
    .watch(['**/*.html'])
    .on('change', browserSync.reload);
});


//
gulp.task('modernizr', () => gulp
  .src([
    'src/js/**/*.js',
    'src/sass/**/*.scss'
  ])
  .pipe($.modernizr(
    'modernizr.custom.js',
    {
      options: [
        'setClasses',
        'addTest',
        'prefixes',
        'testStyles'
      ],
      tests: [
        'touchevents'
      ]
    }
  ))
  .pipe(gulp.dest('dist'))
);


//
gulp.task('sass:lint', _sassLint);


//
gulp.task('css', ['sass:lint'], () => gulp
  .src(['src/sass/**/*.scss'])
  .pipe($.plumber())
  .pipe($.sourcemaps.init())
  .pipe($.sassGlob())
  .pipe($.sass({
    outputStyle: 'expanded',
    errLogToConsole: true
  })
    .on('error', $.sass.logError))
  .pipe($.postcss([
    autoprefixer({
      browsers: [
        'last 2 version'
      ]
    }),
    pxtorem({rootValue: 16}),
    mqpacker({sort: true})
  ]))
  .pipe($.sourcemaps.write('.'))
  .pipe(gulp.dest('dist'))
  .pipe(browserSync.stream())
);


//
gulp.task('js:lint', () => gulp
  .src([
    "gulpfile.js",
    "src/js/**/*.+js"
  ])
  .pipe($.eslint({
    globals: [
      "Modernizr",
      "jQuery"
    ]
  }))
  .pipe($.eslint.format('stylish'))
);


//
gulp.task('js', ['js:lint'], () => gulp
  .src(['src/js/**/*.js'])
  .pipe($.plumber())
  .pipe($.sourcemaps.init())
  .pipe($.babel({
    presets: [
      [
        'env',
        {
          'targets': {
            'browsers': [
              'last 2 versions'
            ]
          }
        }
      ]
    ]
  }))
  .pipe($.sourcemaps.write('.'))
  .pipe(gulp.dest('dist'))
  .pipe(browserSync.stream())
);


// dev
gulp.task('dev:clean', () => gulp
  .src(['dist'], {read: false})
  .pipe($.clean())
);


//
gulp.task('dev:build', (callback) => {
  runSequence('dev:clean', ['js', 'css'], callback);
});


// remove all development files
gulp.task('dist:clean', () => gulp
  .src([
      './node_modules',
      '.eslintrc.yml',
      '.sass-lint.yml',
      'bower.json',
      'gulpfile.js',
      'package.json',
      'readme.md'
    ], {read: false})
  .pipe($.clean())
);


// build and clean – removes all development-files!
gulp.task('dist:build', (callback) => {
  runSequence('build', 'dist:clean', callback);
});

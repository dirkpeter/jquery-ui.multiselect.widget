'use strict';

module.exports = function (grunt) {
  // show elapsed time at the end
  require('time-grunt')(grunt);

  // Load all grunt tasks matching the `grunt-*` pattern.
  require('load-grunt-tasks')(grunt);

  var config = {
    base:       './',
    livereload: 35729,
    js:         'src',
    scss:       'sass',
    css:        'src',
    sassdoc:    'sass-doc',
    tests:      'tests'
  };

  var lrSnippet = require('connect-livereload')({port: config.livereload});

  var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
  };

  var pkg = grunt.file.readJSON('package.json');

  grunt.initConfig({
    pkg: pkg,

    conf: config,

    watch: {
      compass:    {
        files: ['<%= conf.scss %>/**/*.scss'],
        tasks: ['compass:dev']
      },
      livereload: {
        options: {
          livereload: config.livereload
        },
        files:   [
          '<%= conf.css %>/{,*/}*.css',
          '<%= conf.js %>/{,*/}*.js'
        ]
      }
    },

    connect: {
      options:    {
        port:     9000,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, config.base)
            ];
          }
        }
      },
      dist:       {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, yeomanConfig.dist)
            ];
          }
        }
      }
    },

    compass: {
      options: {
        config:     'config.rb',
        bundleExec: true
      },
      dev:     {
        options: {
          debugInfo:   true,
          environment: 'development'
        }
      },
      dist:    {
        options: {
          environment: 'production'
        }
      }
    },

    concurrent: {
      dev:     [
        'devtools',
        'watch'
      ],
      dist:    [
        'compass:dist'
      ],
      options: {
        limit:               5,
        logConcurrentOutput: true
      }
    },

    sassdoc: {
      default: {
        src:     '<%= conf.scss %>',
        dest:    '<%= conf.sassdoc %>',
        options: {
          verbose:  true,
          display:  {
            access:    ['public', 'private'],
            alias:     true,
            watermark: true
          },
          groups:   {
            'undefined': 'General',
            'color':     'Colors'
          },
          force:    true,
          package:  pkg,
          theme:    'default',
          basePath: '../<%= conf.scss %>'
        }
      }
    },

    scsslint: {
      allFiles: [
        '<%= conf.scss %>/**/*.scss'
      ],
      options:  {
        bundleExec:     true,
        config:         '.scss-lint.yml',
        reporterOutput: 'scss-lint-report.xml',
        colorizeOutput: true
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: ['<%= conf.js %>/{,**/}*.js', '!<%= conf.js %>/{,**/}*.min.js']
    },

    uglify: {
      dist: {
        files: {
          'dst/jquery-ui.multiselect.widget.min.js': ['<%= conf.js %>/jquery-ui.multiselect.widget.js']
        }
      }
    },

    casper: {
      options: {
        test: true,
        engine : 'slimerjs'
      },
      basic: {
        src: ['<%= conf.tests %>/casperjs/basic_*.js']
      }
    },

    bower: {
      target: {
        options: {
          transitive: true
        }
      }
    }
  });

  // default task
  grunt.registerTask('default', [
    'concurrent:dev'
  ]);

  // linting
  grunt.registerTask('lint', [
    'scsslint',
    'jshint'
  ]);

  // testing
  grunt.registerTask('test', [
    'casper:basic'
  ]);

  // build distribution
  grunt.registerTask('build', [
    'compass:dist',
    'uglify:dist'
  ]);

  grunt.registerTask('dev', [
    'connect:livereload',
    'open:dev',
    'watch'
  ]);
};

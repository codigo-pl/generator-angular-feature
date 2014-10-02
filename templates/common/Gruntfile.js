// Generated on <%= (new Date).toISOString().split('T')[0] %> using <%= pkg.name %> <%= pkg.version %>
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: {
      // configurable paths
      // Application path will be read from config.json file (this.config.app.path).
      app: '<%= config.app.path %>',
      dist: 'dist'
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {<% if (coffee) { %>
      coffee: {
        files: ['<%= config.source.gruntPath %>/{,*/}*.{coffee,litcoffee,coffee.md}'],
        tasks: ['newer:coffee:dist']
      },
      coffeeTest: {
        files: ['<%= config.test.gruntPath.replace(/\{\{feature\}\}/, '**') %>/spec/{,*/}*.{coffee,litcoffee,coffee.md}'],
        tasks: ['newer:coffee:test', 'karma']
      },<% } else { %>
      js: {
        files: ['<%= config.source.gruntPath %>/{,*/}*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: true
        }
      },
      jsTest: {
        files: ['<%= config.test.gruntPath.replace(/\{\{feature\}\}/, '**') %>/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },<% } %><% if (compass) { %>
      compass: {
        files: ['<%= config.styles.gruntPath.replace(/\{\{feature\}\}/, '**') %>/{,*/}*.{scss,sass}'],
        tasks: ['compass:server', 'autoprefixer']
      },<% } else { %>
      styles: {
        files: ['<%= config.styles.gruntPath.replace(/\{\{feature\}\}/, '**') %>/{,*/}*.css'],
        tasks: ['newer:copy:styles', 'autoprefixer']
      },<% } %>
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%%= connect.options.livereload %>'
        },
        files: [
          '<%%= yeoman.app %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',<% if (coffee) { %>
          '.tmp/scripts/{,*/}*.js',<% } %>
          '<%= config.images.gruntPath.replace(/\{\{feature\}\}/, '**') %>/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            '<%%= yeoman.app %>'
          ]
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%%= yeoman.app %>'
          ]
        }
      },
      dist: {
        options: {
          base: '<%%= yeoman.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js'<% if (!coffee) { %>,
        '<%= config.source.gruntPath %>/{,*/}*.js'<% } %>
      ]<% if (!coffee) { %>,
      test: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: ['<%= config.test.gruntPath.replace(/\{\{feature\}\}/, '**') %>/spec/{,*/}*.js']
      }<% } %>
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%%= yeoman.dist %>/*',
            '!<%%= yeoman.dist %>/.git*'
          ]
        }]
      },
      unnecessary: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            'src',
            '<%%= yeoman.dist %>/vendor',
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },

    // Automatically inject Bower components into the app
    'bower-install': {
      app: {
        html: '<%%= yeoman.app %>/index.html',
        ignorePath: '<%%= yeoman.app %>/'
      }
    },

<% if (coffee) { %>
    // Compiles CoffeeScript to JavaScript
    coffee: {
      options: {
        sourceMap: true,
        sourceRoot: ''
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.source.gruntPath %>',
          src: '{,*/}*.coffee',
          dest: '.tmp/scripts',
          ext: '.js'
        }]
      },
      test: {
        files: [{
          expand: true,
          cwd: '<%= config.test.gruntPath.replace(/\{\{feature\}\}/, '**') %>/spec',
          src: '{,*/}*.coffee',
          dest: '.tmp/spec',
          ext: '.js'
        }]
      }
    },<% } %>

<% if (compass) { %>
    // Compiles Sass to CSS and generates necessary files if requested
    compass: {
      options: {
        sassDir: '<%= config.styles.gruntPath.replace(/\{\{feature\}\}/, '**') %>',
        cssDir: '.tmp/styles',
        generatedImagesDir: '.tmp/images/generated',
        imagesDir: '<%= config.images.gruntPath.replace(/\{\{feature\}\}/, '**') %>',
        javascriptsDir: '<%= config.source.gruntPath %>',
        fontsDir: '<%=config.fonts.gruntPath.replace(/\{\{feature\}\}/, '**') %>',
        importPath: '<%= config.vendor.gruntPath.replace(/\{\{feature\}\}/, '**') %>/bower_components',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/styles/fonts',
        relativeAssets: false,
        assetCacheBuster: false
      },
      dist: {
        options: {
          generatedImagesDir: '<%%= yeoman.dist %>/images/generated'
        }
      },
      server: {
        options: {
          debugInfo: true
        }
      }
    },<% } %>

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%%= yeoman.dist %>/src/{,*/}*.js',
            '<%%= yeoman.dist %>/styles/{,*/}*.css',
            '<%%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%%= yeoman.dist %>/styles/fonts/*'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%%= yeoman.app %>/index.html',
      options: {
        dest: '<%%= yeoman.dist %>'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        assetsDirs: ['<%%= yeoman.dist %>']
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.images.gruntPath.replace(/\{\{feature\}\}/, '**') %>',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%%= yeoman.dist %>/images'
        }]
      }
    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.images.gruntPath.replace(/\{\{feature\}\}/, '**') %>',
          src: '{,*/}*.svg',
          dest: '<%%= yeoman.dist %>/images'
        }]
      }
    },
    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%%= yeoman.dist %>',
          src: ['*.html', '<%= config.view.path %>/{,*/}*.html'],
          dest: '<%%= yeoman.dist %>'
        }]
      }
    },

    // DEPRECATED
    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    // ngmin: {
    //   dist: {
    //     files: [{
    //       expand: true,
    //       cwd: '.tmp/concat/scripts',
    //       src: '*.js',
    //       dest: '.tmp/concat/scripts'
    //     }]
    //   }
    // },

    ngAnnotate: {
      dist: {
        options: {
            add: true,
            remove: false,
            singleQuotes: false
        },
        files: [{
          expand: true,
          cwd: '<%%= yeoman.dist %>',
          src: 'src/**/*.js',
          dest: '<%%= yeoman.dist %>'
        }]
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%%= yeoman.dist %>/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%%= yeoman.app %>',
          dest: '<%%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            '<%= config.view.gruntPath.replace(/\{\{feature\}\}/, '**') %>/{,*/}*.html',
            '<%= config.vendor.gruntPath.replace(/\{\{feature\}\}/, '**') %>/bower_components/**/*',
            '<%= config.images.gruntPath.replace(/\{\{feature\}\}/, '**') %>/{,*/}*.{webp,png,jpg,jpeg,gif,svg}',
            '<%= config.fonts.gruntPath.replace(/\{\{feature\}\}/, '**') %>/*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%%= yeoman.dist %>/images',
          src: ['generated/*']
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= config.styles.gruntPath.replace(/\{\{feature\}\}/, '**') %>',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [<% if (coffee) { %>
        'coffee:dist',<% } %><% if (compass) { %>
        'compass:server'<% } else { %>
        'copy:styles'<% } %>
      ],
      test: [<% if (coffee) { %>
        'coffee',<% } %><% if (compass) { %>
        'compass'<% } else { %>
        'copy:styles'<% } %>
      ],
      dist: [<% if (coffee) { %>
        'coffee',<% } %><% if (compass) { %>
        'compass:dist',<% } else { %>
        'copy:styles',<% } %>
        'imagemin',
        'svgmin'
      ]
    },

    // By default, your `index.html`'s <!-- Usemin block --> will take care of
    // minification. These next options are pre-configured if you do not wish
    // to use the Usemin blocks.
    cssmin: {
      dist: {
        files: {
          '<%%= yeoman.dist %>/styles/main.css': [
            '.tmp/styles/{,*/}*.css',
            '<%%= yeoman.app %>/styles/{,*/}*.css'
          ]
        }
      }
    },
    uglify: {
      options: {
        mangle: false
      },
      dist: {
        files: {
          '<%%= yeoman.dist %>/scripts/scripts.js': [
            '<%%= yeoman.dist %>/scripts/scripts.js'
          ]
        }
      }
    },
    concat: {
      dist: {}
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    }
  });


  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'bower-install',
      'concurrent:server',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });

  grunt.registerTask('test', [
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'bower-install',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    //'ngmin',
    'ngAnnotate',
    'concat',
    'copy:dist',
    'cdnify',
    'cssmin',
    'uglify',
    'rev',
    'usemin',
    'htmlmin',
    'clean:unnecessary'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test',
    'build'
  ]);
};

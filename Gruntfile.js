/**
 * Grunt automation.
 */
module.exports = function(grunt) {

  var getTime = function(){

    return new Date().getTime();

  };

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    app: {
      src: 'src',
      dist: 'dist',
      tests: 'tests',
      example: 'example',
      pkg: grunt.file.readJSON('bower.json')
    },

    concat: {
      dev: {
        src: [
          '<%= app.src %>/utils/*.js',
          '<%= app.src %>/angular-sails-io.js',
          '<%= app.src %>/angular-sails-base.js',
          '<%= app.src %>/angular-sails-stream.js'
        ],
        dest: '<%= app.dist %>/<%= app.pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        sourceMap: true,
        banner: '/*\n'
              + '  <%= app.pkg.name %> <%= app.pkg.version %>-build' + getTime() + '\n'
              + '  Built with <3 by Balderdashy'
              + '*/'
      },
      dist: {
        files: {
          '<%= app.dist %>/<%= app.pkg.name %>.min.js': ['<%= app.dist %>/<%= app.pkg.name %>.js']
        }
      }
    },

    jshint: {

      options: {
        reporter: require('jshint-stylish'),
        jshintrc: true
      },

      all: [
        '<%= app.src %>/**/*.js',
        '<%= app.tests %>/**/*.spec.js'
      ]
    },

    watch: {
      source: {
        files: ['<%= app.src %>/**/*.js'],
        tasks: ['newer:jshint'],
        options: {
          debounceDelay: 500,
          atBegin: true
        }
      },
      tests: {
        files: ['<%= app.tests %>/**/*.spec.js'],
        tasks: ['newer:jshint', 'karma:precompile'],
        options: {
          debounceDelay: 500,
          atBegin: true
        }
      }
    },

    karma: {
      precompile: {
        configFile: 'karma.conf.js'
      },
      postcompile: {
        configFile: 'karma.postcompile.conf.js',
      }
    }

  });


  // Registered tasks.
  grunt.registerTask('default', ['dev']);

  grunt.registerTask('dev', ['watch']);

  grunt.registerTask('test', ['karma:precompile']);

  grunt.registerTask('build', [
    'jshint',
    'karma:precompile',
    'concat',
    'uglify',
    'karma:postcompile'
  ]);
};

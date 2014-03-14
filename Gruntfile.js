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
      pkg: grunt.file.readJSON('bower.json')

    },

    concat: {
      dev: {
        src: [
          '<%= app.src %>/**/*.js'
        ],
        dest: '<%= app.dist %>/<% app.pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        sourceMap: true,
        banner: '/*\n'
              + '  <%= app.pkg.name %> <%= app.pkg.version %>-build' + getTime() + '\n'
              + '  Built with <3 by Balderdashy'
              + '*/'  //NOTE: Don't Judge me - Andrew
      },
      dist: {
        files: {
          '<%= app.dist %>/<%= app.pkg.name %>.min.js': ['<%= app.dist %>/<% app.pkg.name %>.js']
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
    }

  });

  grunt.registerTask('default', ['watch']);

  // Dev enviroment for copying over changes from src to example project.
  grunt.registerTask('build', [
    'jshint',
    'karma:precompile',
    'concat',
    'uglify',
    'karma:postcompile'
  ]);


}

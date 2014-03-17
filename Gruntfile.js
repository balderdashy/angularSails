/**
 * Grunt automation.
 */
module.exports = function(grunt) {



  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    app: {

      src: 'src',
      dist: 'dist',
      tests: 'tests',
      organization: 'Balderdashy',
      pkg: grunt.file.readJSON('bower.json'),

      generateBanner: function(){

        var getTime = function(){

          return new Date().getTime();

        };

        var getCoreContributors = function(){
          var authors = require('./bower.json').authors,
              str = '  Core Contributors: \n',
              i;


          for(i = 0; i < authors.length; i++){
            str += '   -' + authors[i] + '\n';
          }

          return str;
        };

        return '/*\n'
              + '  <%= app.pkg.name %> <%= app.pkg.version %>-build' + getTime() + '\n'
              + '  Built with <3 by <%= app.organization %>\n\n'  //NOTE: Don't Judge me - Andrew
              + getCoreContributors()
              + '*/';
      }

    },

    concat: {
      options: {
        banner: '<%= app.generateBanner() %>'
      },
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
        banner: '<%= app.generateBanner() %>'
      },
      dist: {
        files: {
          '<%= app.dist %>/<%= app.pkg.name %>.min.js': ['<%= app.dist %>/<% app.pkg.name %>.js']
        }
      }
    },

    clean: {
      dist: ['<%= app.dist %>']
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
        configFile: 'karma.precompile.conf.js'
      },
      postcompile: {
        configFile: 'karma.postcompile.conf.js'
      }
    }

  });

  grunt.registerTask('default', ['watch']);

  // Dev enviroment for copying over changes from src to example project.
  grunt.registerTask('build', [
    'jshint',
    'karma:precompile',
    'clean',
    'concat',
    'uglify',
    'karma:postcompile'
  ]);


}

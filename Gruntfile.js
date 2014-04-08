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
      vendor: 'vendor',
      tests: 'tests',
      example: 'example/assets/',
      pkg: grunt.file.readJSON('bower.json')
    },


     traceur: {
          options: {
              // traceur options here
          },
          custom: {
              files:{
                  'build/all.js': ['js/**/*.js']
              }
          }
      },

    concat: {
      sails: {
        src: [
          '<%= app.src %>/sails/ngsails.js',
          '<%= app.src %>/sails/**/*.js'
//          '<%= app.src %>/angular-sails-base.js'
        ],
        dest: '<%= app.dist %>/angular-sails-sdk.js'
      },
      resource: {
            src: [
                '<%= app.src %>/resource/resource.js',
                '<%= app.src %>/resource/**/*.js'
            ],
            dest: '<%= app.dist %>/angular-sails-resource.js'
      },
       socket: {
            src: [
                '<%= app.src %>/socket/socket.js','<%= app.src %>/socket/utils.js'
            ],
            dest: '<%= app.dist %>/angular-sails-socket.js'
        }
    },

    copy: {
      example: {
        src: '<%= app.dist %>/*.js',
        dest: '<%= app.example %>/js/angular-sails/',
        flatten : true,
        expand : true
      },
       vendor: {
            src: ['<%= app.vendor %>/**/*.js','<%= app.vendor %>/**/*.js'],
            dest: '<%= app.example %>/js/vendor/',
            flatten : true,
            expand : true
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
        tasks: ['concat:sails','concat:resource','concat:socket','copy:example'],
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


    grunt.loadNpmTasks('grunt-contrib-copy');

  // Registered tasks.
 grunt.registerTask('default', ['concat:sails']);
//
//  grunt.registerTask('dev', ['watch']);
//
//  grunt.registerTask('test', ['karma:precompile']);
//
//  grunt.registerTask('build', [
////    'jshint',
////    'karma:precompile',
////    'concat',
//    'uglify',
//    'copy',
//    'karma:postcompile'
//  ]);
};

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
      example: 'example/assets/',
      pkg: grunt.file.readJSON('bower.json')
    },



    concat: {
      sails: {
        src: [
          '<%= app.src %>/sails/sails.js',
          '<%= app.src %>/stream/*.js'
//          '<%= app.src %>/angular-sails-base.js'
        ],
        dest: '<%= app.dist %>/angular-sails.js'
      },
      resource: {
            src: [
                '<%= app.src %>/sails-resource/sails-resource.js',
                '<%= app.src %>/sails-resource/**/*.js'
            ],
            dest: '<%= app.dist %>/angular-sails-resource.js'
      },
       socket: {
            src: [
                '<%= app.src %>/sails-socket/**/*.js'
            ],
            dest: '<%= app.dist %>/angular-sails.io.js'
        }
    },

    copy: {
      example: {
        src: '<%= app.dist %>/*.js',
        dest: '<%= app.example %>/js/angular-sails/',
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

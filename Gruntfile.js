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

        ngdocs: {
            all: ['dist/ngsails.js']
        },

        concat: {
            sails: {
                src: ['module.prefix','<%= app.src %>/*.js','module.suffix'],
                dest: '<%= app.dist %>/ngsails.io.js'
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
                dest: '<%= app.example %>/js/',
                flatten : true,
                expand : false
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
                tasks: ['concat:sails','ngdocs:all','copy:example'],
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

    grunt.loadNpmTasks('grunt-ngdocs');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Registered tasks.
    grunt.registerTask('default', ['concat:sails']);

    grunt.registerTask('docs', ['ngdocs']);

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

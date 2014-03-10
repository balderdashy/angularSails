/**
 * Grunt automation.
 */
module.exports = function(grunt) {

  grunt.initConfig({

    angularSails: {
      base: 'src/angular-sails-base.js',
      socket: 'src/angular-sails-socket.js',
      example: 'example/assets/js/deps/angularSails.js',
      dist: 'dist/angularSails.js'
    },

    concat: {
      dev: {
        src: ['<%= angularSails.socket %>', '<%= angularSails.base %>'],
        dest: '<%= angularSails.dist %>'
      }
    },

    copy: {
      dev: {
        src: '<%= angularSails.dist %>',
        dest: '<%= angularSails.example %>'
      }
    },

    watch: {
      files: '<%= angularSails.base %>',
      tasks: ['concat', 'copy']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['dev']);

  // Dev enviroment for copying over changes from src to example project.
  grunt.registerTask('dev', ['watch']);


}

/**
 * Grunt automation.
 */
module.exports = function(grunt) {

  grunt.initConfig({

    angularSails: {
      src: 'src/angularSails.js',
      example: 'example/assets/js/deps/angularSails.js'
    },

    copy: {
      dev: {
        src: '<%= angularSails.src %>',
        dest: '<%= angularSails.example %>'
      }
    },

    watch: {
      files: '<%= angularSails.src %>',
      tasks: ['copy']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['dev']);

  // Dev enviroment for copying over changes from src to example project.
  grunt.registerTask('dev', ['watch']);


}

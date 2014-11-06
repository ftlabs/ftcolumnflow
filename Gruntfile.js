module.exports = function(grunt) {

  grunt.initConfig({
    buster: {
      test: {
        config: 'test/buster.js'
      },
      server: {
        port: 1111
      }
    }
  });
  grunt.loadNpmTasks('grunt-buster');
};
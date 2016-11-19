module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-screeps');

    grunt.initConfig({
        screeps: {
            options: {
                email: 'essl.main@gmail.com',
                password: 'esS7lilbnc',
                branch: 'default',
                ptr: false
            },
            dist: {
                src: ['default/*.js']
            }
        }
    });
}

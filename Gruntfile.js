'use strict';

module.exports = function (grunt){
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        // plugin configuration details here
        jshint: {
            all: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: ['test/**/*.js',
                    'lib/**/*.js',
                    '*.js']
            }
        },
        env: {
            dev: {
                NODE_ENV: 'test'
            }
        },
        mochaTest: {
            test: {
                options: {
                    globals: ['assert'],
                    reporter: 'spec',
                    ui: 'bdd',
                    captureFile: 'results.txt', // Optionally capture the reporter output to a file
                    quiet: false // Optionally suppress output to standard out (defaults to false)
                },
                src: ['test/**/*.js']
            }
        },
        nodemon: {
            dev: {
                script: 'app.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-nodemon');

    grunt.registerTask('test', ['env:dev', 'jshint', 'mochaTest:test']);
    grunt.registerTask('default', ['jshint', 'mochaTest:test', 'nodemon:dev']);
};

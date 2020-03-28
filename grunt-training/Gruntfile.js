module.exports = function (grunt) {

    require('time-grunt')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        concat: {
            dist: {
                src: [
                    'src/scripts/first.js', 
                    'src/scripts/second.js'
                ],
                dest: 'dest/index.js'
            }
        },
        
        cssmin: {
            with_banner: {
                options: {
                    banner: '/* A minified CSS */'
                },
        
                files: {
                    'dest/style.min.css' : [
                        'src/styles/fsStyle.css', 
                        'src/styles/scStyle.css'
                    ]
                }
            }
        },
        
        watch: {
            scripts: {
                files: ['src/js/*.js'],
                tasks: ['concat', 'removelogging']
            },

            css: {
                files: ['src/css/*.css'],
                tasks: ['cssmin']
            }
        },
        
        removelogging: {
            dist: {
                src: "dest/build.min.js",
                dest: "dest/build.clean.js"
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-remove-logging');
    
    grunt.registerTask(
        'default', 
        ['concat', 'cssmin', 'removelogging', 'watch']
    );

    grunt.registerTask('test', ['']);
};
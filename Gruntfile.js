module.exports = function( grunt )
{
    // project config
    grunt.initConfig( {
        pkg: grunt.file.readJSON( 'package.json' ),

        concat: {
            dist: {
                options: {
                    separator: grunt.util.linefeed + grunt.util.linefeed + grunt.util.linefeed,
                },
                src: [  'build/header.txt',
                        'src/stickyplayer.js',
                        'build/footer.txt'],
                dest: 'dist/stickyplayer.js',
            },
        },

        uglify: {
            dist: {
                options: {
                    sourceMap: false,
                    banner: '/*! <%= pkg.name %> v<%= pkg.version %> */ '
                },
                files: [ {
                    expand: true,
                    cwd: 'dist/',
                    src: ['stickyplayer.js'],
                    dest: 'dist/',
                    ext: '.min.js'
                }, ],
            },
        },

        copy: {
            dist: {
                expand: true,
                cwd: '',
                src: ['assets/*'],
                dest: 'dist/',
                flatten: true,
            },
        },

        sass: {
            options: {
                sourcemap: 'none'
            },
            dist: {
                files: {
                    'dist/stickyplayer.css': 'src/stickyplayer.scss',
                },
            },
        },

        cssmin: {
            dist: {
                options: {
                    banner: '/*! <%= pkg.name %> v<%= pkg.version %> */ '
                },
                files: [ {
                    expand: true,
                    cwd: 'dist/',
                    src: ['stickyplayer.css'],
                    dest: 'dist/',
                    ext: '.min.css'
                }, ],
            },
        },

        watch: {
            files: ['src/*', 'assets/*'],
            tasks: ['concat', 'uglify', 'copy', 'sass', 'cssmin'],
        },

    } );


    // load uglify
    grunt.loadNpmTasks( 'grunt-contrib-concat' );
    grunt.loadNpmTasks( 'grunt-contrib-uglify' );
    grunt.loadNpmTasks( 'grunt-contrib-sass' );
    grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
    grunt.loadNpmTasks( 'grunt-contrib-copy' );
    grunt.loadNpmTasks( 'grunt-contrib-watch' );

    // default task
    grunt.registerTask( 'default', ['concat', 'uglify', 'copy', 'sass', 'cssmin'] );

}
// set default source and build directories
const gutil = require("gulp-util");
const program = require('commander')
    .option('--docs', 'Docs development')
    .parse(process.argv);
let config;
if(!program.docs){
    config = {
        src: process.cwd() + "/src",
        dist: process.cwd() + "/dist",
        sass: {
            exclude: ["bower_components/**/*.scss"]
        },
        production: program.production,
        bowerAssets: [],
        copy: [
            "**/*.pug"
        ],
        server: {
            port: program.port || 8081,
            codeSync: !program.disableLiveReload,
            files: "./src/**/*.{html,htm,css,js}",
            server: {
                baseDir: program.baseDir || "./"
            },
            open: !program.disableLiveReload
        },
        sourcemap: !(!!program.production || program.noSourcemap)
    };
}else{
    config = {
        src: process.cwd() + "/docs",
        dist: process.cwd() + "/doc",
        sass: {
            exclude: ["bower_components/**/*.scss"]
        },
        production: program.production,
        bowerAssets: [],
        copy: [
            "**/*.pug"
        ],
        server: {
            port: program.port || 8081,
            codeSync: !program.disableLiveReload,
            files: "./src/**/*.{html,htm,css,js}",
            server: {
                baseDir: program.baseDir || "./"
            },
            open: !program.disableLiveReload
        },
        sourcemap: !(!!program.production || program.noSourcemap)
    };
}
module.exports = config;
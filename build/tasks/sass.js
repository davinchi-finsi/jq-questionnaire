'use strict';
const BaseTask = require("./BaseTask.js");
const gulp = require('gulp');
const gutil = require("gulp-util");
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const debug = require("gulp-debug");
const path = require("path");
const config = require("./../config");
class SassTask extends BaseTask {
    _compile(files) {
        this.gutil.log("Compiling sass");
        return gulp.src(files)
            .pipe(debug())
            .pipe(this.sourcemaps.init())
            .pipe(this.sass({outputStyle: "expanded"}).on('error', this.sass.logError))
            .pipe(this.sourcemaps.write())
            .pipe(this.gulp.dest(this.gulpConfig.src));
    }
}
let sassTask = new SassTask({
    gulpConfig: config,
    taskConfig: {
        files: "**/*.scss",
        exclude: config.sass
            ? config.sass.exclude
            : null,
        compileAllOnChange: true
    },
    gulp: gulp,
    debug: debug,
    path: path,
    gutil: gutil,
    sass: sass,
    sourcemaps: sourcemaps
});
gulp.task('sass:build', function () {
    sassTask.build();
});

gulp.task('sass:watch', function () {
    gutil.log("Waiting for sass changes");
    sassTask.watch();
});

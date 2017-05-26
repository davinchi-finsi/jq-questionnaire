'use strict';

const config = require('./../config');
const gulp = require('gulp');
const clean = require("gulp-clean");
gulp.task('_copy-bower-assets', ["_clean-bower-assets"], function () {
    return gulp.src(config.bowerAssets)
        .pipe(gulp.dest(config.dist + '/bower_components/'))
});
gulp.task('_clean-bower-assets', function () {
    return gulp.src(config.dist + "/bower_components")
        .pipe(clean({force: true}));
});
gulp.task("copy-bower-assets", ["_clean-bower-assets", "_copy-bower-assets"]);
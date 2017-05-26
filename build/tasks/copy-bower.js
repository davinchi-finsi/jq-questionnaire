'use strict';

const config = require('./../config');
const gulp = require('gulp');
const clean = require("gulp-clean");
gulp.task('_copy-bower', ["_clean-bower"], function () {
    return gulp.src(config.bower)
        .pipe(gulp.dest(config.dist + '/bower_components/'))
});
gulp.task('_clean-bower', function () {
    return gulp.src(config.dist + "/bower_components")
        .pipe(clean({force: true}))
});
gulp.task("copy-bower", ["_clean-bower", "_copy-bower"]);
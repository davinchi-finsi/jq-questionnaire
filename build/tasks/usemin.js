const gulp = require('gulp');
const usemin = require('gulp-usemin');
const uglify = require('gulp-uglify');
const minifyCss = require('gulp-minify-css');
const rev = require('gulp-rev');
const ngAnnotate = require('gulp-ng-annotate');
const config = require('./../config');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
let processors = [
    autoprefixer({browsers: ['last 5 version', "ie 10", "ie 11"]}),
];
gulp.task('usemin:build', function () {
    return gulp.src(config.src + '/index.html')
        .pipe(usemin({
            js: [ngAnnotate()],
            css: [postcss(processors)],
            cssVendor: [postcss(processors)]
        }))
        .pipe(gulp.dest(config.dist));
});

gulp.task('usemin:dist', function () {
    return gulp.src(config.src + '/index.html')
        .pipe(usemin({
            js: [ngAnnotate(), uglify(), rev()],
            jsVendor: [uglify(), rev()],
            css: [minifyCss(), rev(), postcss(processors)],
            cssVendor: [minifyCss(), rev(), postcss(processors)]
        }))
        .pipe(gulp.dest(config.dist));
});
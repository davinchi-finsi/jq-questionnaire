const gulp = require("gulp");
const gutil = require("gulp-util");
const config = require("../config");
const path = require("path");
const debug = require("gulp-debug");
const headerComment = require("gulp-header-comment");
gulp.task("header", function(){
    gulp.src(path.join(config.dist,'**/*.js'))
        .pipe(headerComment(`        
            jqQuiz plugin v<%= pkg.version %>
            https://github.com/davinchi-finsi/jq-quiz
            
            Copyright <%= pkg.author %> and other contributors
            Released under the MIT license
            https://github.com/davinchi-finsi/jq-quiz/blob/master/LICENSE
            
            Build: <%= moment().format("DD/MM/YYYY HH:mm") %>
        `))
        .pipe(gulp.dest(config.dist));
});



var gulp = require('gulp');
var shell = require('gulp-shell');

gulp.task('getUrls', shell.task('node crawl/crawl.js'));
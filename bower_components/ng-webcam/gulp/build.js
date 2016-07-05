'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var plugin = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('dist', function() {
  return gulp.src(path.join(conf.paths.src, '/!(*.spec).js'))
    .pipe(plugin.useref())
    .pipe(plugin.sourcemaps.init())
    .pipe(plugin.concat('ng-webcam.min.js', {newLine: ';'}))
    .pipe(plugin.bytediff.start())
    .pipe(plugin.uglify({ preserveComments: plugin.uglifySaveLicense })).on('error', conf.errorHandler('Uglify'))
    .pipe(plugin.bytediff.stop())
    .pipe(plugin.sourcemaps.write())
    .pipe(gulp.dest(conf.paths.dist))
    .pipe(plugin.size({ title: path.join(conf.paths.dist, '/'), showFiles: true }));
});

gulp.task('src', function() {
  return gulp.src(path.join(conf.paths.src, '/!(*.spec).js'))
    .pipe(plugin.useref())
    .pipe(plugin.bytediff.start())
    .pipe(plugin.bytediff.stop())
    .pipe(gulp.dest(conf.paths.dist))
    .pipe(plugin.size({ title: path.join(conf.paths.dist, '/'), showFiles: true }));
});

gulp.task('clean', function () {
  return plugin.del([path.join(conf.paths.dist, '/')]);
});

gulp.task('build', ['src', 'dist']);
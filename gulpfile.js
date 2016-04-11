var gulp = require('gulp');
var sass = require('gulp-sass');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');

var scssPaths = [
    './scss/*.scss',
    './scss/**/*.scss',
    './scss/bootstrap/*.scss',
    './scss/app.scss',
];

var jsPaths = [
    './scripts/**/*.js',
];

gulp.task('sass', function() {
    gulp.src(scssPaths)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./css'));
});

gulp.task('js-build', function() {
    return browserify({
        entries: './scripts/app.js',
        extensions: ['.js', '.jsx'],
        debug: true
    })
        .transform(babelify, {presets: ['es2015', 'react']})
        .bundle()
        .pipe(source('app.js'))
        .pipe(gulp.dest('./js'));
});

gulp.task('watch', function() {
    gulp.watch(scssPaths, ['sass']);
    gulp.watch(jsPaths, ['js-build']);
});

var distDir = 'dist'

var gulp = require('gulp');
var mainBowerFiles = require('gulp-main-bower-files');
var jade = require('gulp-jade');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var gulpFilter = require('gulp-filter');
var concat = require('gulp-concat');
var minify = require('gulp-minify-css');
var rename = require("gulp-rename");
var inject = require('gulp-inject');
var file = require('gulp-file');
var imagemin = require('gulp-imagemin');
var connect = require('gulp-connect');
var ngHtml2Js = require("gulp-ng-html2js");
var minifyHtml = require("gulp-minify-html");
var clean = require('gulp-clean');
var cors = require('cors');

gulp.task('jade', function() {
    return gulp.src('jade/*.jade')
        .pipe(jade())
        .pipe(gulp.dest(distDir + '/tmp'))
});

gulp.task('html2js', ['jade'], function() {
    return gulp.src(distDir + "/tmp/*.html")
      	.pipe(minifyHtml({
      		empty: true,
      		spare: true,
      		quotes: true
      	}))
      	.pipe(ngHtml2Js({
      		moduleName: "HTMLTemplates",
      		prefix: ""
      	}))
      	.pipe(concat("templates.min.js"))
      	.pipe(uglify())
      	.pipe(gulp.dest(distDir + "/"));
});

gulp.task('templates', ['html2js'], function() {
  return gulp.src(distDir + "/tmp")
      .pipe(clean());
});

gulp.task('sass', function() {
    return gulp.src('scss/**/*.scss')
        .pipe(sass())
        .pipe(concat('app.css'))
        .pipe(minify({compatibility: '*'}))
        .pipe(gulp.dest(distDir + '/css'));
});

gulp.task('images', function() {
    gulp.src(['img/*.{jpg,png,svg,gif}'])
        .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
        .pipe(gulp.dest(distDir + '/img'));
});

gulp.task('fonts', function() {
    gulp.src(['**/fonts/*.{eot,ttf,woff,woff2,otf,svg}'])
        .pipe(rename({dirname: ''}))
        .pipe(gulp.dest(distDir + '/fonts'));
});

gulp.task('libs', function() {
    var cssFilter = gulpFilter('**/*.css', { restore: true });
    var jsFilter = gulpFilter('**/*.js', { restore: true });
    return gulp.src(['libs/**/*.js', 'libs/**/*.css'])
        .pipe(jsFilter)
        .pipe(concat('libs.js'))
        //.pipe(uglify())
        .pipe(gulp.dest(distDir + '/libs'))

        .pipe(jsFilter.restore)
        .pipe(cssFilter)
        .pipe(concat('libs.css'))
        .pipe(minify({compatibility: '*'}))
        .pipe(gulp.dest(distDir + '/libs'))
        .pipe(cssFilter.restore)
});

gulp.task('scripts', function() {
    return gulp.src(['js/**/*.js'])
        .pipe(concat('all.js'))
        .pipe(gulp.dest(distDir + '/js'))
});

gulp.task('vendor', function(){
    var cssFilter = gulpFilter('**/*.css', { restore: true });
    var jsFilter = gulpFilter('**/*.js', { restore: true });
    return gulp.src('./bower.json')
      .pipe(mainBowerFiles())
      .pipe(jsFilter)
      .pipe(concat('vendor.js'))
      //.pipe(uglify())
      .pipe(gulp.dest(distDir + '/js'))
      .pipe(jsFilter.restore)
      .pipe(cssFilter)
      .pipe(concat('vendor.css'))
      .pipe(minify({compatibility: '*'}))
      .pipe(gulp.dest(distDir + '/css'))
      .pipe(cssFilter.restore)

});



gulp.task('dist',['vendor', 'libs', 'templates', 'sass', 'scripts', 'fonts', 'images'], function () {
    return gulp.src('index.html')
        .pipe(gulp.dest(distDir));
});

gulp.task('dist-mobile',['vendor', 'libs', 'templates', 'sass', 'scripts', 'fonts', 'images'], function () {
    return gulp.src('index.html')
        .pipe(inject(file('cordova.js', '', {src: 'true'}), {relative: true}))
        .pipe(gulp.dest(distDir));
});

gulp.task('watch',['dist'],function(){
    gulp.watch("scss/*.scss", ['dist']);
    gulp.watch("js/**/*.js", ['dist']);
    gulp.watch("libs/**/*.js", ['dist']);
    gulp.watch("jade/**/*.jade", ['dist']);
});

gulp.task('connect', function() {
  connect.server({
    root: distDir,
    port: '8080',
    livereload: true,
    middleware: function() {
        return [cors()];
    }
  });
});

gulp.task('serve',['connect', 'watch']);

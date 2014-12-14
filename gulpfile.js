var gulp = require('gulp');
var gutil = require('gulp-util');
var less = require("gulp-less");
var autoprefixer = require("gulp-autoprefixer");
var to5 = require('gulp-6to5');
var del = require("del");
var jade = require("gulp-jade")

gulp.task("less", function () {
  gulp.src("app/client/style/admin.less")
    .pipe(less({
      paths: ["node_modules"]
    }))
    .pipe(autoprefixer())
    .on("error", gutil.log)
    .pipe(gulp.dest("./app/.assets/style/"));
});

gulp.task('watch', function () {
  gulp.watch(["app/client/style/*.less"], ["less"]);
  gulp.watch(["app/client/templates/*.jade"], ["jade"]);
  gulp.watch(["app/client/js/**/*.js"], ["es6"]);
});

gulp.task("jade", function () {
  gulp.src("app/client/templates/*.jade")
    .pipe(jade())
    .pipe(gulp.dest("./app/.assets/templates/"))
});

gulp.task('es6', function () {
  return gulp.src('app/client/js/**/*.js')
    .pipe(to5())
    .pipe(gulp.dest('app/.assets/client/js/'));
});

gulp.task("build", ["jade", "less", "es6"]);
gulp.task("default", ["build"]);

gulp.task('clean', function (cb) {
  del([
    '.app/definitions',
    '.app/js'
  ], cb);
});

gulp.task("build", ["jade", "less", "es6"]);
gulp.task("default", ["clean"], function () {
  return gulp.start("build");
});
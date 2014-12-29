module.exports = function (gulp) {
  var path = require("path");
  var config = require("config");
  var gutil = require('gulp-util');
  var less = require("gulp-less");
  var autoprefixer = require("gulp-autoprefixer");
  var to5 = require('gulp-6to5');
  var del = require("del");
  var jade = require("gulp-jade");
  var ngHtml2Js = require("gulp-ng-html2js");
  var concat = require("gulp-concat");
  var uglify = require('gulp-uglify');
  var ngAnnotate = require('gulp-ng-annotate');
  var gulpif = require("gulp-if");
  var streamqueue = require('streamqueue');
  var cached = require("gulp-cached");
  var remember = require("gulp-remember");

  var base = process.cwd();

  var paths = {
    base: base,
    less: {
      src: base + "/app/client/style",
      dest: base + "/app/.assets/style"
    },
    jade: {
      src: base + "/app/client/templates",
      dest: base + "/app/.assets/templates"
    },
    js: {
      src: base + "/app/client/js",
      dest: base + "/app/.assets"
    },
    clean: [base + "/app/.assets"]
  };

  gulp.task("less", function () {
    gulp.src(paths.less.src + "/app.less")
      .pipe(less({
        //paths: ["node_modules"] //change to bower components?
      }))
      .pipe(autoprefixer())
      .on("error", gutil.log)
      .pipe(gulp.dest(paths.less.dest));
  });

  gulp.task("jade", function () {
    gulp.src(paths.jade.src + "/*.jade")
      .pipe(jade())
      .pipe(ngHtml2Js({
        moduleName: "app",
        prefix: "templates/"
      }))
      .pipe(concat("templates.js"))
      .pipe(gulp.dest(paths.jade.dest))
  });

  gulp.task('es6', function () {
    var min = config.get("assets.min");

    var assets = require("./app/server/assets");
    var moduleName = "app";
    var moduleContent = assets.expandModule(moduleName);

    var cwd = base + "/app/client/";

    var js = moduleContent.js.map(function (item) {
      return "js/" + item;
    });

    var js = gulp.src(js, {cwd: cwd, base: cwd})
      .pipe(cached())
      .pipe(to5())
      .pipe(remember());
    var components = gulp.src(moduleContent.components, {cwd: cwd, base: cwd});
    var merged = streamqueue({ objectMode: true }, components, js);

    return merged
      .pipe(gulpif(min, concat("js/" + moduleName + ".js")))
      .pipe(gulpif(min, ngAnnotate()))
      .pipe(gulpif(min, uglify()))
      .pipe(gulp.dest(paths.js.dest));
  });


  gulp.task('watch', ["default"], function () {
    gulp.watch([paths.less.src + "/**/*.less"], ["less"]);
    gulp.watch([paths.jade.src + "/*.jade"], ["jade"]);
    gulp.watch([paths.js.src + "**/*.js"], ["es6"]); //todo glob components files
  });

  gulp.task("build", ["jade", "less", "es6"]);
  gulp.task("default", ["build"]);

  gulp.task('clean', function (cb) {
    return del(paths.clean, cb);
  });

  gulp.task("clean", function (cb) {
    del(['app/.assets/'], cb);
  });

  gulp.task("build", ["jade", "less", "es6"]);

  gulp.task("default", ["clean"], function () {
    return gulp.start("build");
  });
};
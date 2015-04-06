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
  var iconfont = require("gulp-iconfont");
  var consolidate = require("gulp-consolidate");

  var assets = require("./app/server/assets");

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
    clean: [base + "/app/.assets"],
    fonts: {
      src: base + "/app/client/fonts/**/*",
      dest: base + "/app/.assets/fonts"
    },
    static: {
      src: base + "/app/client/static/**/*",
      dest: base + "/app/.assets/static"
    },
    images: {
      src: base + "/app/client/images/**/*",
      dest: base + "/app/.assets/images"
    }
  };

  gulp.task("less", function () {
    var baseClient = base + "/app/client/";

    assets.getModulesNames().forEach(function (moduleName) {
      var mod = assets.expandModule(moduleName);
      gulp.src(baseClient + mod.style)
        .pipe(less({
          paths: [base + "/app/client/components/"]
        }))
        .on("error", gutil.log)
        .pipe(autoprefixer())
        .on("error", gutil.log)
        .pipe(gulp.dest(paths.less.dest));
    });

  });

  gulp.task("jade", function () {
    gulp.src(paths.jade.src + "/**/*.jade")
      .pipe(jade())
      .on("error", gutil.log)
      .pipe(ngHtml2Js({
        moduleName: "app",
        prefix: "templates/"
      }))
      .pipe(concat("templates.js"))
      .pipe(gulp.dest(paths.jade.dest))
  });


  var moduleNames = assets.getModulesNames();

  var es6tasks = [];
  moduleNames.forEach(function (moduleName) {
    var taskName = "es6[" + moduleName + "]";
    es6tasks.push(taskName);
    gulp.task(taskName, function () {
      var min = config.get("assets.min");
      var assets = require("./app/server/assets");
      var moduleContent = assets.expandModule(moduleName);

      var cwd = base + "/app/client/";

      var jsFiles = moduleContent.js.map(function (item) {
        return "js/" + item;
      });

      var js = gulp.src(jsFiles, {cwd: cwd, base: cwd})
        .pipe(cached(taskName))
        .pipe(to5())
        .on("error", function (e) {
          console.log(e.message);
        })
        .pipe(remember(taskName));
      var components = gulp.src(moduleContent.components, {cwd: cwd, base: cwd});
      var merged = streamqueue({objectMode: true}, components, js);

      return merged
        .pipe(gulpif(min, concat("js/" + moduleName + ".js")))
        .pipe(gulpif(min, ngAnnotate()))
        .pipe(gulpif(min, uglify()))
        .pipe(gulp.dest(paths.js.dest));
    });
  });

  gulp.task('es6', es6tasks);

  gulp.task('watch', ["default"], function () {
    var assets = require("./app/server/assets");
    var jsFiles = base + "/app/client/js/**/*.js";

    console.log("watching less files ", paths.less.src + "/**/*.less");

    gulp.watch([paths.less.src + "/**/*.less"], ["less"]);
    gulp.watch([paths.jade.src + "/**/*.jade"], ["jade"]);
    gulp.watch(jsFiles, ["es6"]);
    gulp.watch(paths.fonts.src, ["fonts"]);
    gulp.watch(paths.images.src, ["images"]);
  });

  gulp.task("fonts", function () {
    return gulp.src(paths.fonts.src)
      .pipe(gulp.dest(paths.fonts.dest));
  });
  
  gulp.task("static", function () {
    return gulp.src(paths.static.src)
      .pipe(gulp.dest(paths.static.dest));
  });

  gulp.task("images", function () {
    return gulp.src(paths.images.src)
      .pipe(gulp.dest(paths.images.dest));
  });

  gulp.task("generate-icons", function () {
    console.log("generate icons", base + '/app/client/icons/*.svg');
    console.log("generate icons", __dirname + '/app/client/icons/icons.less');
    console.log("generate icons", base + 'app/client/style');
    console.log("fonts", base + 'app/assets/fonts');

    return gulp.src([base + '/app/client/icons/*.svg'])
      .pipe(iconfont({fontName: 'icons'}))
      .on('codepoints', function (codepoints, options) {
        gulp.src(__dirname + '/app/client/icons/icons.less')
          .pipe(consolidate('underscore', {
            glyphs: codepoints,
            fontName: 'icons',
            fontPath: '../fonts/',
            className: 's'
          }))
          .on("error", gutil.log)
          .pipe(gulp.dest(base + '/app/client/style'));
      })
      .pipe(gulp.dest(base + '/app/client/fonts'));
  });

  gulp.task("icons", ["generate-icons"], function () {
    return gulp.start("less", "fonts");
  });

  gulp.task("build", ["jade", "less", "es6", "fonts", "images", "static"]);

  gulp.task('clean', function (cb) {
    return del(paths.clean, cb);
  });

  gulp.task("default", ["clean"], function () {
    return gulp.start("build");
  });

};
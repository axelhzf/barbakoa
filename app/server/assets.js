var path = require("path");
var config = require("config");
var gutil = require("gulp-util");
var chalk = require("chalk");
var prettyTime = require('pretty-hrtime');
var glob = require("simple-glob");

exports.initialize = function* () {
  if (config.get("assets.reload")) {
    var gulp = require("gulp");
    var gulptasks = require("../../gulptasks");
    gulptasks(gulp);

    gulp.on('err', function () {
      gutil.log("[assets] error");
    });

    gulp.on('task_start', function (e) {
      gutil.log('[assets] starting', '\'' + chalk.cyan(e.task) + '\'...');
    });

    gulp.on('task_stop', function (e) {
      var time = prettyTime(e.hrDuration);
      gutil.log(
        '[assets] finished', '\'' + chalk.cyan(e.task) + '\'',
        'after', chalk.magenta(time)
      );
    });

    gulp.on('task_err', function (e) {
      var msg = e;
      var time = prettyTime(e.hrDuration);
      gutil.log(
        '[assets] \'' + chalk.cyan(e.task) + '\'',
        chalk.red('errored after'),
        chalk.magenta(time)
      );
      gutil.log(msg);
    });

    gulp.on('task_not_found', function (err) {
      gutil.log(
        chalk.red('[assets] task \'' + err.task + '\' is not in your gulpfile')
      );
    });

    gulp.start("watch");

  }
};

exports.expandModule = function (moduleName) {
  var pathApp = config.get("path.app");
  var m = require(path.join(pathApp, "app", "client", moduleName + ".json"));

  var components = m.components.map(function (m) {
    var moduleBase = path.join(pathApp, "app", "client", "components", m);
    var bjson = require(path.join(moduleBase, "bower.json"));
    var main = bjson.main;
    return path.join("components", m, main);
  });

  var js = glob({cwd: path.join(pathApp, "app", "client", "js")}, m.js).map(function (file) {
    return "js/" + file;
  });

  return {
    components: components,
    js: js,
    style: m.style
  };

};

exports.getModule = function (moduleName) {
  var min = config.get("assets.min");
  var js;
  if (!min) {
    var m = exports.expandModule(moduleName);
    js = m.components.concat(m.js);
  } else {
    js = ["js/" + moduleName + ".js"]
  }

  return {
    js: js,
    style: "style/" + moduleName + ".css"
  };
};
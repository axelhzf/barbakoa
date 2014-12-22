var path = require("path");
var config = require("config");
var gutil = require("gulp-util");
var chalk = require("chalk");
var prettyTime = require('pretty-hrtime');

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
      var msg = formatError(e);
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
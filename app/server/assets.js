var path = require("path");
var config = require("config");
var prettyTime = require('pretty-hrtime');
var glob = require("simple-glob");
var _ = require("underscore");
var _s = require("underscore.string");
var log = require("./logger").child({component: "assets"});

exports.initialize = function () {
  if (config.get("assets.reload")) {
    var gulp = require("gulp");
    var gulptasks = require("../../gulptasks");
    gulptasks(gulp);
    
    gulp.on('err', function () {
      log.error("[assets] error");
    });
    
    gulp.on('task_start', function (e) {
      log.debug({task: e.task}, 'start task');
    });
    
    gulp.on('task_stop', function (e) {
      var time = prettyTime(e.hrDuration);
      log.debug({task: e.task, etime: time}, "end task");
    });
    
    gulp.on('task_err', function (e) {
      var msg = e;
      var time = prettyTime(e.hrDuration);
      log.debug({task: e.task, etime: time}, "task error");
    });
    
    gulp.on('task_not_found', function (err) {
      log.debug({task: e.task}, "task is not in your gulpfile");
    });
    
    gulp.start("watch");
    
  }
};

exports.expandModule = function (moduleName) {
  var pathApp = config.get("path.app");
  var m = require(path.join(pathApp, "app", "client", moduleName + ".json"));
  
  var components = m.components.map(function (m) {
    if (_s.endsWith(m, ".js")) {
      return path.join("components", m);
    } else {
      var moduleBase = path.join(pathApp, "app", "client", "components", m);
      var bjson = require(path.join(moduleBase, "bower.json"));
      var main = bjson.main;
      
      if (_.isArray(main)) {
        main = _.find(main, function (file) {
          return _s.endsWith(file, ".js");
        });
      }
      
      if (main) {
        return path.join("components", m, main);
      } else {
        return "";
      }
    }
  });
  
  return {
    components: components,
    js: m.js,
    style: m.style
  };
  
};

exports.getModulesNames = function () {
  var pathApp = config.get("path.app");
  var baseClient = path.join(pathApp, "app", "client");
  var modules = glob({cwd: baseClient}, "*.json").map(function (file) {
    return path.basename(file, ".json");
  });
  return modules;
};

exports.getModule = function (moduleName) {
  var min = config.get("assets.min");
  var js;
  if (!min) {
    var m = exports.expandModule(moduleName);
    var pathApp = config.get("path.app");
    js = glob({cwd: path.join(pathApp, "app", "client", "js")}, m.js).map(function (file) {
      return "js/" + file;
    });
    js = m.components.concat(js);
  } else {
    js = ["js/" + moduleName + ".js"]
  }
  
  return {
    js: js,
    style: "style/" + moduleName + ".css"
  };
};
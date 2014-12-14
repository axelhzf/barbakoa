var koa = require("koa");

var _ = require("underscore");
var co = require("co");

var koaBody = require("koa-body");
var views = require("koa-views");
var mount = require("koa-mount");
var session = require('koa-session');
var flash = require("koa-flash");
var staticCache = require('koa-static-cache');
//var csrf = require('./lib/csrf');

var config = require("config");
var logger = require("./logger");
var db = require("./db");
var router = require("./router");
var cron = require("./cron");


function barbakoa() {

  var app = koa();

  app.use(views('views', {
    default: 'jade'
  }));

  mountStatic("/assets", __dirname + '/../.assets');
  mountStatic("/assets", __dirname + '/../assets');
  mountStatic("/assets", __dirname + '/../client');


  if (config.get("logs.request")) {
    app.use(require("koa-logger")());
  }

  app.use(require("./error")());
  app.use(koaBody());
  app.keys = config.keys;
  app.use(session(app));
  app.use(flash());




//locals
  app.use(function *(next) {
    this.locals = {
      _: _,
      flash: this.flash,
      csrf: this.csrf,
      config: config,
      requestPath: this.request.path,
      routeUrl: router.routeUrl
    };
    yield *next;
  });


// server methods
  var server;

  app.start = function () {
    console.log("start");

    co(function * () {
      if (config.get("db.sync")) {
        yield db.syncAllModels();
      }

      router.configure(app);

      server = app.listen(config.get("port"));

      if (config.get("assets.reload")) {
        var gulp = require("gulp");
        require("../../gulpfile");
        gulp.start("watch");
      }
    }).catch(function (e) {
      console.log(e.stack);
    });
  };

  app.stop = function () {
    server.close();
  };

  function mountStatic(url, path) {
    logger.info("mounting %s to %s", path, url);
    var assets = koa();
    assets.use(staticCache(path));
    app.use(mount(url, assets));
  }

  return app;

};


barbakoa.router = router;

module.exports = barbakoa;


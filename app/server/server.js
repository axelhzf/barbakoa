var koa = require("koa");

var _ = require("underscore");
var co = require("co");

var koaBody = require("koa-body");
var views = require("koa-views");
var mount = require("koa-mount");
var session = require('koa-session');
var flash = require("koa-flash");
var staticCache = require('koa-static-cache');
var static = require("koa-static");
var fs = require("mz/fs");
var config = require("config");
var logger = require("./logger");
var db = require("./db");
var router = require("./router");
var cron = require("./cron");
var path = require("path");
var assets = require("./assets");


function barbakoa() {

  var app = koa();

  var appPath = path.join(config.get("path.app"), "app");

  var viewPath = path.join(appPath, "server", "views");
  app.use(views(viewPath, {
    default: 'jade',
    ext: "jade"
  }));

  console.log("jelou!");
  mountStatic("/assets", path.join(appPath, '.assets'));
  mountStatic("/assets", path.join(appPath, '/assets'));
  mountStatic("/assets", path.join(appPath, '/client'));


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
      yield db.initialize();
      router.configure(app);
      yield assets.initialize();

      server = app.listen(config.get("port"));
    }).catch(function (e) {
      console.trace("Error", e.stack);
    });
  };

  app.stop = function () {
    server.close();
  };

  function mountStatic(url, path) {
    var staticLib = config.get("assets.cache") ? require("koa-static-cache"): require("koa-static");
    co(function* () {
      var exists = yield fs.exists(path);
      if (exists) {
        console.log("mounting %s to %s", path, url);
        var assets = koa();
        assets.use(staticLib(path));
        app.use(mount(url, assets));
      } else {
        console.log("path %s doesn't exists", path);
      }
    });
  }

  return app;

}


barbakoa.router = router;
barbakoa.db = db;

module.exports = barbakoa;


var koa = require("koa");

var _ = require("underscore");
_.mixin(require('safe-obj'));

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
var events = require("./events");
var log = require("./logger").child({component: "server"});
var migrations = require("./migrations");


function barbakoa() {

  var app = koa();

  var appPath = path.join(config.get("path.app"), "app");

  var viewPath = path.join(appPath, "server", "views");

  app.use(views(viewPath, {
    default: 'jade',
    ext: "jade"
  }));

  mountStatic("/assets", path.join(appPath, '.assets'));

  if (config.get("logs.request")) {
    var requestLogger = log.child({component: "request"});
    app.use(require("koa-bunyan")(requestLogger, {level: "debug", timeLimit: 100}));
  }

  require('koa-qs')(app); //nested query string
  app.use(require("./error")());
  app.use(koaBody({multipart: true, formidable: {uploadDir: config.get("uploads.path")}}));
  app.keys = config.keys;
  app.use(session(app));
  app.use(flash());

  app.use(require("./validations"));

//locals
  app.use(function *(next) {
    if (!this.locals) {
      this.locals = {};
    }
    
    _.extend(this.locals, {
      _: _,
      flash: this.flash,
      csrf: this.csrf,
      config: config,
      requestPath: this.request.path,
      routeUrl: router.routeUrl
    });
    
    yield *next;
  });


// server methods
  var server;

  app.start = function () {
    return co(function * () {
      yield events.emit("pre-start");
      yield db.initialize();
      yield migrations.execute();
      router.configure(app);
      server = app.listen(config.get("port"));
      yield events.emit("post-start");
    }).catch(function (e) {
      log.error("Error", e);
      log.error("Error", e.stack);
    });
  };

  app.stop = function () {
    return co(function* () {
      server.close();
    });
  };

  function mountStatic(url, path) {
    var staticLib = config.get("assets.cache") ? require("koa-static-cache") : require("koa-static");
    co(function* () {
      var exists = yield fs.exists(path);
      if (exists) {
        log.debug("mounting %s to %s", path, url);
        var assets = koa();
        assets.use(staticLib(path));
        app.use(mount(url, assets));
      } else {
        log.error("path %s doesn't exists", path);
      }
    });
  }

  barbakoa.mountStatic = mountStatic;

  app.on("error", function (e) {
    console.trace(e);
    console.trace(e.stack);
  });

  return app;

}

barbakoa.events = events;
barbakoa.router = router;
barbakoa.db = db;
barbakoa.assets = assets;
barbakoa.JobsQueue = require("./lib/JobsQueue");
barbakoa.api = {
  resource: require("./api/resource")
};
barbakoa.logger = logger;
barbakoa.migrations = require("./migrations");

if (process.env.NODE_ENV === "test") {
  barbakoa.test = {
    server: {
      utils: {
        dbUtils: require("../../test/server/utils/dbUtils")
      },
      run: require("../../test/server/test")
    },
    client: {
      run: require("../../test/client/clientTestRunner")
    }
  };
}


module.exports = barbakoa;


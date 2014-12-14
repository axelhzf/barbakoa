var router = require("koa-router");

var indexController = require("./controllers/indexController");
var userApi = require("./api/userApi");
var tweetApi = require("./api/tweetApi");

var r = new router();

r.get("/", indexController.index);

r.get("/api/users", userApi.list);
r.get("/api/users/:id", userApi.get);
r.get("/api/tweets", tweetApi.list);
r.get("/api/tweets/:id", tweetApi.get);

exports.configure = function (app) {
  app.use(notFound);
  app.use(r.middleware());
};

exports.routeUrl = function () {
  return r.url.apply(r, arguments);
};

function* notFound(next) {
  if (r.match(this.path)) {
    yield next;
    if (this.status === 405) this.throw("405 / Method not Allowed", 405);
  } else {
    this.throw('404 / Not Found', 404)
  }
}
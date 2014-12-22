var koaRouter = require("koa-router");

var indexController = require("./controllers/indexController");
var userApi = require("./api/userApi");
var tweetApi = require("./api/tweetApi");

var router = new koaRouter();

router.configure = function (app) {
  app.use(notFound);
  app.use(router.middleware());
};

router.routeUrl = function () {
  return router.url.apply(router, arguments);
};

module.exports = router;


function* notFound(next) {
  if (router.match(this.path)) {
    yield next;
    if (this.status === 405) this.throw("405 / Method not Allowed", 405);
  } else {
    this.throw('404 / Not Found', 404)
  }
}
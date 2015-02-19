var config = require("config");
var http = require('http');
var path = require("path");
var cons = require('co-views');

module.exports = error;

function error(opts) {
  opts = opts || {};

  // template
  var path = opts.template || __dirname + '/error.html';

  // env
  return function *error(next) {
    try {
      yield next;
      if (404 == this.response.status && !this.response.body) this.throw(404);
    } catch (err) {
      this.status = err.status || 500;

      // application
      this.app.emit('error', err, this);

      var debugErrors = config.get("errors.debug");

      if (err.name === "ValidationError") { //expose joi errors
        err.expose = true;
      }
      
      
      // accepted types
      switch (this.accepts('html', 'text', 'json')) {
        case 'text':
          if (debugErrors) {
            this.body = err.message
          } else if (err.expose) {
            this.body = err.message
          } else {
            throw err;
          }
          break;

        case 'json':
          if (debugErrors) {
            this.body = {errors: err.message};
          } else if (err.expose) {
            this.body = {errors: err.message}
          } else {
            this.body = {errors: http.STATUS_CODES[this.status]}
          }
          break;

        case 'html':
          var stack = err.stack;
          var frameworkPath = config.get("path.framework");

          var render = cons(frameworkPath + "/app/server/views/", {default: "jade"});
          this.body = yield render("error", {stack: stack});
          this.type = 'text/html';

          //yield this.render("error/error", {
          //  debug: debugErrors,
          //  ctx: this,
          //  request: this.request,
          //  response: this.response,
          //  error: err.message,
          //  stack: stack,
          //  status: this.status,
          //  code: err.code
          //});
          break;
      }
    }
  }
}
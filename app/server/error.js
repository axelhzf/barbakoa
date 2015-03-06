var config = require("config");
var http = require('http');
var path = require("path");
var cons = require('co-views');
var fs = require("mz/fs");
var _ = require("underscore");

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
      
      if (err.name === "ValidationError") { //expose joi errors
        err.status = 400;
        err.expose = true;
        err.message = err.details.map(function (detail) {
          return {code: "VALIDATION", path: detail.path, message: detail.message}
        });
      }
      
      this.status = err.status || 500;

      // application
      this.app.emit('error', err, this);

      var debugErrors = config.get("errors.debug");
      
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
          
          if(!_.isArray(err.message)) {
            err.message = [{
              code: err.code,
              message: err.message
            }];
          }
          
          if (debugErrors) {
            this.body = {
              errors: err.message
            };
          } else if (err.expose) {
            this.body = {
              errors: err.message
            }
          } else {
            this.body = {errors: http.STATUS_CODES[this.status]}
          }
          break;

        case 'html':
          var stack = err.stack;
          var frameworkPath = config.get("path.framework");
          var appPath = config.get("path.app");

          var appErrorTemplateExists = yield fs.exists(appPath + "/app/server/views/error.jade");
          var errorPath = appErrorTemplateExists ? appPath + "/app/server/views/" : frameworkPath + "/app/server/views/";
          var render = cons(errorPath, {default: "jade"});
          var locals;
          if (debugErrors) {
            locals = _.extend(this.locals, {stack: stack});
          } else {
            locals = this.locals;
          }
          this.body = yield render("error", locals);
          this.type = 'text/html';
          
          break;
      }
    }
  }
}
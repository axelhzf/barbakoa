var _ = require("underscore");
var Joi = require("joi");

function validate(value, schema) {
  return function (cb) {
    Joi.validate(value, schema, function (err, value) {
      if (!err) {
        cb(null, value)
      } else {
        err.status = 400;
        err.expose = true;
        err.message = err.details.map(function (detail) {
          return {path: detail.path, message: detail.message}
        });
        cb(err);
      }
    });
  }
}

function* middleware(next) {
  var ctx = this;
  ctx.validateParams = function* (schema) {
    var params = _.extend({}, ctx.params);
    return yield validate(params, schema);
  };
  ctx.validateQuery = function* (schema) {
    var query = ctx.query;
    return yield validate(query, schema);
  };
  ctx.validateBody = function* (schema) {
    var body = ctx.request.body;
    return yield validate(body, schema);
  };
  yield next;
}

module.exports = middleware;
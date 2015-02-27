var _ = require("underscore");
var Joi = require("joi");
var Promise = require("bluebird");

var validate = Promise.promisify(Joi.validate);

function* middleware(next) {
  var ctx = this;
  ctx.validateParams = function* (schema) {
    var params = _.extend({}, ctx.params);
    return yield validate(params, schema, {abortEarly: false});
  };
  ctx.validateQuery = function* (schema) {
    var query = ctx.query;
    return yield validate(query, schema, {abortEarly: false});
  };
  ctx.validateBody = function* (schema) {
    var body = ctx.request.body;
    return yield validate(body, schema, {abortEarly: false});
  };
  yield next;
}

module.exports = middleware;
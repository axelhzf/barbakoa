var _ = require("underscore");
var Joi = require("joi");

module.exports = function (Model, options) {
  options || (options = {});

  var resource = {
    list: function* () {
      var query = yield this.validateQuery(Joi.object().keys({
        limit: Joi.number().integer().min(1),
        offset: Joi.number().integer().min(0),
        order: Joi.string(),
        where: Joi.array(),
        attributes: Joi.any()
      }));
      var findParams = _.defaults(query || {}, {limit: 5, offset: 0});
      var models = yield Model.findAndCountAll(findParams);
      var result = {
        limit: findParams.limit,
        offset: findParams.offset,
        total: models.count,
        order: findParams.order,
        items: _.map(models.rows, serialize)
      };

      this.body = result;
    },

    get: function* () {
      var id = parseInt(this.params["id"], 10);
      var model = yield Model.find(id);
      if (!model) {
        return this.throw("Resource doesn't exists", 404);
      }
      this.body = serialize(model);
    },
    one: function* () {
      var where = this.query;
      var model = yield Model.find({where: where});
      if (!model) {
        return this.throw("Resource doesn't exists", 404);
      }
      this.body = serialize(model);
    }
  };

  function serialize(item) {
    var serialized = item.toJSON();
    if (options.fields) {
      serialized = _.pick(serialized, options.fields);
    } else if (options.excludeFields) {
      serialized = _.omit(serialized, options.excludeFields);
    }
    return serialized;
  }

  return resource;
};


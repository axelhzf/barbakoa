var _ = require("underscore");
module.exports = function (Model, options) {
  options || (options = {});

  var resource = {
    list: function* () {
      var limit = parseInt(this.query.limit, 10) || 5;
      var offset = parseInt(this.query.offset, 10) || 0;
      var order = this.query.order;

      var findParams = {
        limit: limit,
        offset: offset,
        order: order,
        where: this.query.where,
        attributes: this.query.attributes
      };

      var models = yield Model.findAndCountAll(findParams);
      var result = {
        limit: limit,
        offset: offset,
        total: models.count,
        order: order,
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


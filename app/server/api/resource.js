import _ from "underscore";
import Joi from "joi";

export default
class Resource {

  constructor(Model, options) {
    this.Model = Model;
    this.options = options || {};
  }

  *list() {
    var query = yield this.validateQuery(Joi.object().keys({
      limit: Joi.number().integer().min(1),
      offset: Joi.number().integer().min(0),
      order: Joi.string(),
      where: Joi.array(),
      attributes: Joi.any()
    }));
    var findParams = _.defaults(query || {}, {limit: 5, offset: 0});
    var models = yield this.Model.findAndCountAll(findParams);
    var result = {
      limit: findParams.limit,
      offset: findParams.offset,
      total: models.count,
      order: findParams.order,
      items: _.map(models.rows, serialize)
    };

    this.body = result;
  }

  *get() {
    var where = this.query;
    var model = yield this.Model.find({where: where});
    if (!model) {
      return this.throw("Resource doesn't exists", 404);
    }
    this.body = serialize(model);
  }

  serialize() {
    var serialized = item.toJSON();
    if (this.options.fields) {
      serialized = _.pick(serialized, this.options.fields);
    } else if (this.options.excludeFields) {
      serialized = _.omit(serialized, this.options.excludeFields);
    }
    return serialized;
  }
}

var _ = require("underscore");

class Model {
  constructor (attrs) {
    _.extend(this, attrs);
  }
}

module.exports = Model;

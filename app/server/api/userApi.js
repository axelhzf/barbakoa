var resource = require("./resource");
var User = require("../models/User");
module.exports = resource(User, {
  excludeFields: ["accessToken"]
});
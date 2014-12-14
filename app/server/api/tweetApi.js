var resource = require("./resource");
var Tweet = require("../models/Tweet");

module.exports = resource(Tweet, {
  excludeFields: ["encoded"]
});
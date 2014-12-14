var Sequelize = require("sequelize");
var db = require("../db");

var User = db.define("User", {
  fbId: Sequelize.STRING,
  displayName: Sequelize.STRING,
  accessToken: Sequelize.STRING,
  photo: Sequelize.URL,
  email: Sequelize.STRING
});

module.exports = User;
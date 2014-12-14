var path = require("path");
var fs = require("fs");
var _ = require("underscore");
var Sequelize = require("sequelize");
var config = require("config");
var debug = require("debug")("sql");

//Define global data types
Sequelize.URL = Sequelize.STRING(2083);

var db = new Sequelize(config.get("db.database"), config.get("db.username"), config.get("db.password"), {
  logging: debug
});

db.syncAllModels = function (options) {
  options || (options = {});

  var modelPath = path.join(__dirname, "./models");
  var modelFiles = fs.readdirSync(modelPath);

  modelFiles.forEach(function (file) {
    require(path.join(modelPath, file));
  });

  return db.sync({force: options.force});
};

var transaction = db.transaction.bind(db);
db.transaction = function () {
  return function (cb) {
    transaction(function (err, t) {
      cb(err, t);
    });
  }
};

module.exports = db;
var path = require("path");
var fs = require("fs");
var _ = require("underscore");
var Sequelize = require("sequelize");
var config = require("config");
var debug = require("debug")("sql");


var db = new Sequelize(config.get("db.database"), config.get("db.username"), config.get("db.password"), {
  logging: debug
});

db.syncAllModels = function (options) {
  options || (options = {});

  var appPath = path.join(process.cwd(), "app", "server", "models");
  var frameworkPath = path.join(__dirname, "..", "models");

  return syncModelInPath(appPath);
};


function syncModelInPath (modelPath) {
  var options = {};
  console.log("sync models from path", modelPath);

  var modelFiles = fs.readdirSync(modelPath);

  modelFiles.forEach(function (file) {
    require(path.join(modelPath, file));
  });

  return db.sync({force: options.force});
}


var transaction = db.transaction.bind(db);
db.transaction = function () {
  return function (cb) {
    transaction(function (err, t) {
      cb(err, t);
    });
  }
};


var DataTypes = require("sequelize/lib/data-types");
db.types = DataTypes;
db.types.URL = db.types.STRING(2083);

module.exports = db;
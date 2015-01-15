var path = require("path");
var _ = require("underscore");
var Sequelize = require("sequelize");
var config = require("config");
var debug = require("debug")("sql");
var fs = require("mz/fs");
var log = require("./logger").child({component: "db"});

var db = new Sequelize(config.get("db.database"), config.get("db.username"), config.get("db.password"), {
  logging: debug
});

db.initialize = function* () {
  if (config.get("db.sync")) {
    yield syncModels();
  }
};

function* syncModels() {
  var paths = [
    path.join(process.cwd(), "app", "server", "models"),
    path.join(__dirname, "models")
  ];

  var allModels = [];
  for (var i = 0; i < paths.length; i++) {
    var modelPath = paths[i];
    var models = yield requireModelsAtPath(modelPath);
    allModels = allModels.concat(models);
  }

  log.debug({models: allModels}, "Syncing models");

  var syncOptions = {
    force: config.get("db.forceSync")
  };
  yield db.sync(syncOptions);
}

function* requireModelsAtPath(modelPath) {
  var modelFiles = yield fs.readdir(modelPath);
  modelFiles.forEach(function (file) {
    require(path.join(modelPath, file));
  });
  return modelFiles;
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
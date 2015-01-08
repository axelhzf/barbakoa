var path = require("path");
var fs = require("fs");
var _ = require("underscore");
var db = require("../../../app/server/db");
var parallel = require("co-parallel");
var config = require("config");

exports.dropTables = dropTables;
exports.createFixtures = createFixtures;

function* dropTable (tableName) {
  if (tableName.getTableName) {
    tableName = tableName.getTableName();
  }
  return yield db.query("delete from `" + tableName + "`");
}

function* dropTables (tableNames) {
  if (!_.isArray(tableNames)) {
    tableNames = _.toArray(arguments);
  }
  var queries = tableNames.map(dropTable);
  return yield parallel(queries, 4);
}

function* createFixtures (fixtures) {
  var models = getModels();
  var fixtureModels = _.keys(fixtures);
  var queries = fixtureModels.map(function *(fixtureModel) {
    var values = fixtures[fixtureModel];
    yield models[fixtureModel].bulkCreate(values);
  });
  return yield parallel(queries, 4);
}

function getModels () {
  var models = {};
  var frameworkModels = getModelsInDirectory(path.join(config.get("path.framework"), "/app/server/models"));
  var appModels = getModelsInDirectory(path.join(config.get("path.app"), "/app/server/models"));
  _.extend(models, frameworkModels, appModels);

  return models;
}

function getModelsInDirectory(directory) {
  var modelFiles = fs.readdirSync(directory);
  var models = {};
  modelFiles.forEach(function (file) {
    var modelName = path.basename(file, ".js");
    models[modelName] = require(path.join(directory, file));
  });
  return models;
}
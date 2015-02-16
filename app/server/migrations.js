var Umzug = require('umzug');
var db = require("./db");
var config = require("config");
var co = require("co");

exports.execute = function () {
  console.log("executing migrations");
  var umzug = new Umzug({
    storage: 'sequelize',
    storageOptions: {
      sequelize: db,
      modelName: 'Migration',
      tableName: 'Migrations',
      columnName: 'migration',
      columnType: db.types.STRING(100)
    },
    upName: 'up',
    downName: 'down',
    migrations: {
      params: [db.getQueryInterface(), db.types],
      path: config.get("path.app") + '/migrations',
      pattern: /^\d+[\w-]+\.js$/,
      wrap: function (fun) {
        return function (migration, types) {
          return co(function* () {
            yield fun(migration, types);
          });
        };
      }
    }
  });
  
  return umzug.up().then(function (migrations) {
    // "migrations" will be an Array with the names of the
    // executed migrations.
    migrations.forEach(function (migration) {
      console.log("executed migration", migration.file);
    });
  });
  
};
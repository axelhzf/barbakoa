var Umzug = require('umzug');
var db = require("./db");
var config = require("config");
var co = require("co");
var log = require("./logger").child({component: "migrations"});


exports.execute = function () {
  var umzug = new Umzug({
    storage: 'sequelize',
    storageOptions: {
      sequelize: db,
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
      log.info("Executed migrations [%s]", migration.file);
    });
  });
  
};
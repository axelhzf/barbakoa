var Sequelize = require("sequelize");
var db = require("../db");
var _ = require("underscore");

var Job = db.define("Job", {
    name: Sequelize.STRING,
    status: Sequelize.STRING,
    start_uuid: Sequelize.STRING,
    parameters: {
      type: Sequelize.TEXT,
      get: function () {
        var parameters = this.getDataValue("parameters");
        if (parameters) {
          return JSON.parse(parameters);
        }
      },
      set: function (v) {
        this.setDataValue("parameters", JSON.stringify(v));
      }
    }
  }, {
    classMethods: {
      countJobsWithStatusByName: function* (status) {
        var rows = yield db.query("select count(*) as total, name from Jobs where status = ? group by name", null, {raw: true}, [status])
        if (!rows.length) {
          return {};
        }

        return _.reduce(rows, function (result, row) {
          result[row.name] = row.total;
          return result;
        }, {});
      }
    }
  })
  ;

module.exports = Job;
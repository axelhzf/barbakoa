module.exports = function () {
  var gulp = require("gulp");
  var gulptasks = require("../../gulptasks");
  gulptasks(gulp);

  gulp.start("es6", function (err) {
    if (err) {
      console.error(err);
      console.error(err.stack);
      process.exit(1);
    }

    var config = {
      configFile: __dirname + "/karma.conf.js"
    };
    require("karma/lib/server").start(config);
  });

};
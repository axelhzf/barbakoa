var _ = require("underscore");
var path = require("path");
var bunyan = require("bunyan");
var config = require("config");
var mkdirp = require("mkdirp");
var PrettyStream = require('bunyan-prettystream');


var logFilename = path.normalize(config.get("logs.path") + "/" + config.get("name") + ".log");
mkdirp(path.normalize(config.get("logs.path")));

var prettyStdOut = new PrettyStream({
  mode: 'dev'
});
prettyStdOut.pipe(process.stdout);

var log = bunyan.createLogger({
  name: config.name,
  src: config.get("logs.src"),
  streams: [
    {
      level: 'debug',
      type: 'raw',
      stream: prettyStdOut
    },
    {level: 'info', path: logFilename}
  ]
});

// Replace all console logs?
//console.log = function () {
//  var msg = _.toArray(arguments).join(", ");
//  log.info(msg);
//};

//log.info("Writing logging to %s", logFilename);

module.exports = log;
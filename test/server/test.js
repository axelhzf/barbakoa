var co = require("co");
var Mocha = require('mocha');
require("co-mocha");
var path = require('path');
var glob = require("co-glob");
var config = require("config");
var program = require('commander');
GLOBAL.expect = require("chai").expect;

program
  .version(require('../../package.json').version)
  .option('-g, --grep [filter]', "Grep");
program.parse(process.argv);

var mocha = new Mocha({
  reporter: 'spec',
  grep: program.grep
});

function* addFiles() {
  var filePattern = config.get("path.app") + "/test/server/**/*.spec.js";
  var files = yield glob(filePattern);
  files.forEach(function (file) {
    mocha.addFile(file);
  });
}


var server;

function run() {
  return function (cb) {
    mocha.run(function (failures) {
      process.on('exit', function () {
        process.exit(failures);
      });
      cb();
    });
  };
}

function* before() {
  yield server.start();
}

function* after() {
  yield server.stop();
}

function testRunner () {
  server = require(config.get("path.app") + "/app/server/server");
  co(function* () {
    yield before();
    yield addFiles();
    yield run();
    yield after();
    process.exit();
  }).catch(function (e) {
    console.trace(e.stack);
  });
}


var toExport = {
  utils: {
    dbUtils: require("./utils/dbUtils")
  },
  testRunner: testRunner
};
module.exports = toExport;
#!/usr/bin/env node --harmony
var nodemon = require("nodemon");
var program = require("commander");
var assets = require("../app/server/assets");
var log = require("../app/server/logger").child({component: "cli"});
var version = require("./../package.json").version;
var co = require("co");

program
  .version(version)
  .parse(process.argv);

co(function* () {
  log.info("Building application");
  yield assets.initialize();
  log.info("Starting application");
  startNodemon();
}).catch(function (e) {
  console.trace(e.stacktrace);
});

function startNodemon() {
  nodemon({
    script: "app/.server/server.js",
    watch: ["app/.server"],
    "execMap": {
      "js": "node --harmony"
    }
  });

  nodemon.on('start', function () {
    log.debug("Starting app in dev mode");
  }).on('quit', function () {
    log.fatal("App has quit");
  }).on('restart', function (files) {
    log.warn({files: files}, "Restarting app");
  });
}
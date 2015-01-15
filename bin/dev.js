#!/usr/bin/env node --harmony
var assets = require("../app/server/assets");
var log = require("../app/server/logger").child({component: "cli"});

var program = require("commander");
var version = require("./../package.json").version;

program
  .version(version)
  .parse(process.argv);

var nodemon = require("nodemon");

nodemon({
  script: "app/server/server.js",
  watch : ["app/server"],
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


assets.initialize();
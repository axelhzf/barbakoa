#!/usr/bin/env node --harmony

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
  console.log('Starting app in dev mode');
}).on('quit', function () {
  console.log('App has quit');
}).on('restart', function (files) {
  console.log('Restarting app: ', files);
});

#!/usr/bin/env gnode

var program = require("commander");
var version = require("./../package.json").version;

program
  .version(version)
  .parse(process.argv);

#!/usr/bin/env node

var program = require("commander");
var version = require("./../package.json").version;

program
  .version(version)
  .parse(process.argv);

require("../test/server/test").testRunner();
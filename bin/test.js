#!/usr/bin/env node

var program = require("commander");
var version = require("./../package.json").version;

program
  .version(version)
  .parse(process.argv);

process.env.NODE_ENV="test";

require("../test/server/test").testRunner();

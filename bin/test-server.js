#!/usr/bin/env node

var program = require("commander");
var version = require("./../package.json").version;

require("../test/server/test").testRunner();
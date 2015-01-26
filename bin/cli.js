#!/usr/bin/env node

var _ = require("underscore");
var program = require("commander");
var version = require("./../package.json").version;

program.version(version);

program.command("dev")
  .description("Run application in dev mode")
  .action(function () {
    spawn(__dirname + "/dev.js", {
      NODE_ENV: "development",
      NODE_CONFIG_DIR: "./app/server/config"
    });
  });

program.command("test")
  .description("Run server and client side tests")
  .action(function () {
    testClient(function () {
      testServer();
    });
  });

program.command("test-client")
  .description("Run client side tests")
  .action(testClient);

program.command("test-server")
  .option('-g, --grep [filter]', "Grep")
  .option('-c, --coverage', "Coverage")
  .description("Run server side tests")
  .action(testServer);

program.command("init")
  .description("Run server side tests")
  .action(function () {
    spawn(__dirname + "/init.js", {});
  });

function testServer (options, cb) {
  var spawn = require("child_process").spawn;

  if (options.coverage) {
    var cwd = process.cwd();
    var env = _.extend({}, process.env, {
      NODE_ENV: "test",
      NODE_CONFIG_DIR: "./app/server/config"
    });
    var args = ["--harmony", __dirname + "/../node_modules/.bin/istanbul", "cover", __dirname + "/test-server.js"];
    var child = spawn(process.execPath, args, {
      cwd: cwd,
      env: env
    });
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
    child.on("close", function (code) {
      if (_.isFunction(cb)) {
        cb();
      }
    });
  } else {
    spawn(__dirname + "/test-server.js", {
      NODE_ENV: "test",
      NODE_CONFIG_DIR: "./app/server/config"
    }, cb);
  }
}

function testClient (cb) {
  spawn(__dirname + "/test-client.js", {
    NODE_ENV: "test",
    NODE_CONFIG_DIR: "./app/server/config"
  }, cb);
}

program.parse(process.argv);

function spawn(file, env, cb) {
  var spawn = require("child_process").spawn;
  var cwd = process.cwd();
  var env = _.extend({}, process.env, env);
  var args = ["--harmony", file];
  if(program.grep) {
    args.push("grep");
    args.push(program.grep);
  }
  args = args.concat(process.argv.slice(3));
  var child = spawn(process.execPath, args, {
    cwd: cwd,
    env: env
  });
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  child.on("close", function (code) {
    if (_.isFunction(cb)) {
      cb();
    }
  });
}

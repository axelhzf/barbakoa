var exec = require("child_process").exec;
var spawn = require("child_process").spawn;

var src = __dirname + "/../template/*";
var dest = process.cwd();

exec("cp -r " + src + " " + dest, function (err, stdout) {
  console.log(stdout);
});
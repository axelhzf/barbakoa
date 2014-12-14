var glob = require("simple-glob");
var config = require("config");

exports.index = function *() {
  var scripts = getScripts("app");
  console.log("scripts", scripts);
  yield this.render("index/index", {scripts: scripts});
};

function getScripts(moduleName) {
  if (config.get("assets.min")) {
    return ["js/" + moduleName + ".js"];
  } else {
    var scripts = [];
    try {
      var files = require("../../client/js/" + moduleName + ".json");
      scripts = glob({cwd: "app/client/"}, files);
    } catch (e) {

    }
    return scripts;
  }
}
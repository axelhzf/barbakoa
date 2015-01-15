var barbakoa = require("barbakoa");
var router = barbakoa.router;

var app = new barbakoa();

router.get("/", function* () {
  var assets = barbakoa.assets.getModule("app");
  yield this.render("index", {assets: assets});
});

app.start();
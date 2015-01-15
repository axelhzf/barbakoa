var barbakoa = require("barbakoa");
var router = barbakoa.router;

var app = new barbakoa();

router.get("/", function* () {
  yield this.render("index");
});

app.start();
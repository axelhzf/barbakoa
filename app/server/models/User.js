var db = require("../db");

var User = db.define("User", {
  fbId: db.types.STRING,
  displayName: db.types.STRING,
  accessToken: db.types.STRING,
  photo: db.types.URL,
  email: db.types.STRING
});

module.exports = User;
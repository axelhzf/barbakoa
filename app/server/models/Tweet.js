var db = require("../db");

//TODO check field size
module.exports = db.define("Tweet", {
  id_str: db.types.STRING,
  query: db.types.STRING,
  text: db.types.STRING,
  created_at: db.types.STRING,
  user_id_str: db.types.STRING,
  user_name: db.types.STRING,
  user_screen_name: db.types.STRING,
  user_profile_image_url: db.types.URL,
  encoded: db.types.TEXT
});
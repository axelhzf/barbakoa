var Sequelize = require("sequelize");
var db = require("../db");

//TODO check field size
module.exports = db.define("Tweet", {
  id_str: Sequelize.STRING,
  query: Sequelize.STRING,
  text: Sequelize.STRING,
  created_at: Sequelize.STRING,
  user_id_str: Sequelize.STRING,
  user_name: Sequelize.STRING,
  user_screen_name: Sequelize.STRING,
  user_profile_image_url: Sequelize.URL,
  encoded: Sequelize.TEXT
});
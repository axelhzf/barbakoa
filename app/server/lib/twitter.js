var _ = require("underscore");
var config = require("../config");
var Twit = require("twit");
var Tweet = require("../models/Tweet");
var thunkify = require("thunkify");
var parallel = require("co-parallel");

var logger = require("../logger").child({"feature": "twitter"});

module.exports = {
  cronTask: cronTask
};

var T = new Twit({
  consumer_key: config.twitter.consumer_key,
  consumer_secret: config.twitter.consumer_secret,
  access_token: config.twitter.access_token,
  access_token_secret: config.twitter.access_token_secret
});

var get = thunkify(T.get.bind(T));

function* saveTweets (query) {
  var lastTweets = yield Tweet.findAll({where: {query: query}, order: "id_str DESC", limit: 1});
  var sinceId;
  if (lastTweets.length > 0) {
    sinceId = lastTweets[0].id_str;
  }
  var response = yield get("search/tweets", {q: query, since_id: sinceId, count: 50});
  var data = response[0];
  var statuses = data.statuses;
  var saves = statuses.map(function * (status) {
    var fields = parseStatus(status);
    fields.query = query;
    var tweet = yield Tweet.create(fields);
    return tweet;
  });
  var tweets = yield parallel(saves, 3);

  logger.info("Save tweets for %s add %s new tweets", query, tweets.length);

  return tweets;
}

function* cronTask () {
  logger.info("Running twitter cron task");
  var requests = config.twitter.queries.map(saveTweets);
  yield parallel(requests, 3);
}

function parseStatus (status) {
  var fields = _(status).pick("id_str", "text", "created_at");
  fields.user_id_str = status.user.id_str;
  fields.user_name = status.user.name;
  fields.user_screen_name = status.user.screen_name;
  fields.user_profile_image_url = status.user.profile_image_url;
  fields.encoded = JSON.stringify(status);
  return fields;
}
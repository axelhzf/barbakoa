var co = require("co");
//var twitter = require("./lib/twitter");
var cronJob = require('cron').CronJob;

var enableTwitterCron = false;

new cronJob('00 * * * * *', function () {
  co(function* () {
    //yield twitter.cronTask();
  })();
}, null, enableTwitterCron, "America/Los_Angeles");
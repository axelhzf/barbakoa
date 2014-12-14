var _ = require("underscore");
var angular = require("angular");

var Controller = require("../../common/lib/Controller");

class DashboardController extends Controller {
  constructor ($scope, $http) {
    super($scope);
    this.$http = $http;

    this.findUsers();
  }

  findUsers () {
    this.$http.get("/api/users", {params: {limit: 3}}).then((result) => {
      this.$.users = result.data;
    });
  }
}

module.exports = DashboardController;
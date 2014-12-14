var _ = require("underscore");
var angular = require("angular");

var Controller = require("../../common/lib/Controller");

class UsersController extends Controller {
  constructor ($scope, $http) {
    super($scope);
    this.$http = $http;

    this.$.users = new PaginatedResource("/api/users", $http);
    this.$.users.find();

  }
}


class PaginatedResource {

  constructor (path, $http) {
    this.path = path;
    this.$http = $http;

    this.currentPage = 0;
    this.limit = 5;
  }

  findPage(page) {
    this.currentPage = page;
    this.find();
  }

  findNextPage() {
    this.currentPage++;
    this.find();
  }

  findPreviousPage() {
    this.currentPage--;
    this.find();
  }

  get pages() {
    if (this.total) {
      var total = Math.ceil(this.total / this.limit);
      return _.range(0, total);
    }
  }

  find () {
    var params = {limit : this.limit, offset: this.currentPage * this.limit};
    this.$http.get(this.path, {params: params})
      .then((result) => {
        _.extend(this, result.data);
      });
  }

}

module.exports = UsersController;
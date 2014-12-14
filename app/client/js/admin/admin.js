require("traceur-runtime");
var angular = require("angular");
require("angular-route");

var app = angular.module("admin", ["ngRoute"]);

var UsersController = require("./controllers/UsersController");
var DashboardController = require("./controllers/DashboardController");

app.controller("UsersController", UsersController);
app.controller("DashboardController", DashboardController);

app.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      controller: 'DashboardController',
      template: require("./templates/dashboard.jade")
    })
    .when('/users', {
      controller: 'UsersController',
      template: require("./templates/users.jade")
    })
    .otherwise({
      redirectTo: '/'
    });
});



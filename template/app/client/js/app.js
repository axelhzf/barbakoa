var app = angular.module("app", ["ngRoute"]);

app.config(function ($routeProvider) {
  $routeProvider
    .when("/", {
      templateUrl: "templates/template1.html",
      controller: "Template1Controller as ctrl"
    })
    .when("/2", {
      templateUrl: "templates/template2.html"
    })
});

var app = angular.module("app", []);

class TestController {
  constructor() {
    this.counter = 0;
  }

  increment() {
    this.counter++;
  }
}

app.controller("TestController", TestController);
var co = require("co");
var JobsQueue = require("../../../app/server/lib/JobsQueue");
var Job = require("../../../app/server/models/Job");
var Promise = require("bluebird");
var expect = require("chai").expect;
var dbUtils = require("../utils/dbUtils");
var db = require("../../../app/server/db");

require("co-mocha");

describe("JobsQueue", function () {

  var queue;

  before(function* () {
    yield db.initialize();
  });

  beforeEach(function* () {

    yield dbUtils.dropTables(Job);
    queue = new JobsQueue();
  });

  it("should process a task", function (done) {
    queue.addWorker("task1", 1, function (parameters) {
      expect(parameters).to.eql({a: 1, b: 2});
      return Promise.resolve();
    });
    queue.on("done", done);
    queue.start();
    queue.addJob("task1", {a: 1, b: 2});
  });

  it("should save error stack", function* (done) {
    queue.addWorker("task1", 1, function (parameters) {
      return Promise.reject(new Error("Task1 fail"));
    });
    queue.on("done", function () {
      co(function * () {
        var jobs = yield Job.findAll();
        expect(jobs.length).to.equal(1);
        expect(jobs[0].status).to.equal("error");
        expect(jobs[0].stack).to.match(/Task1 fail/);
      }).then(done, done);
    });
    queue.start();
    queue.addJob("task1", {a: 1, b: 2});
  });

});
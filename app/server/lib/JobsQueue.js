var _ = require("underscore");
var co = require("co");
var Job = require("../models/Job");
var debug = require("debug")("job");
var util = require("util");
var EventEmitter = require('events').EventEmitter;
var uuid = require("uuid");

function JobsQueue() {
  this.workers = [];
}

util.inherits(JobsQueue, EventEmitter);

JobsQueue.prototype.addJob = function (name, parameters) {
  var self = this;
  return co(function* () {
    debug("add job %s %s", name, JSON.stringify(parameters));
    yield Job.create({name: name, parameters: parameters, status: "waiting"});
    yield self._tryToExecuteJob();
  });
};

JobsQueue.prototype.addWorker = function (name, parallel, process) {
  this.workers.push({name: name, parallel: parallel, process: process});
};

JobsQueue.prototype._tryToExecuteJob = function* () {
  var running = yield Job.countJobsWithStatusByName("running");
  var waiting = yield Job.countJobsWithStatusByName("waiting");

  //debug("jobs running %s", JSON.stringify(running));
  //debug("jobs waiting %s", JSON.stringify(waiting));

  var taskWaiting = yield Job.count({where: {status: "waiting"}});
  //debug("total task waiting %d", taskWaiting);
  if (taskWaiting === 0) {
    this.emit("done");
    return;
  }

  var self = this;
  for (var i = 0; i < this.workers.length; i++) {
    var worker = this.workers[i];

    var workerHasMoreCapacity = worker.parallel > (running[worker.name] || 0);
    var workerHasWaitingJobs = waiting[worker.name] > 0;
    //debug("[%s] - hasMoreCapacity: %s hasWaitingJobs: %s", worker.name, workerHasMoreCapacity, workerHasWaitingJobs);
    if (workerHasMoreCapacity && workerHasWaitingJobs) {
      //debug("worker %s has capacity to execute", worker.name);

      // atomic update
      var start_uuid = uuid.v4();
      var affectedRows = yield Job.update({
        status: "running",
        start_uuid: start_uuid
      }, {
        where: {status: "waiting", name: worker.name},
        limit: 1
      });

      if (affectedRows[0]) {
        var job = yield Job.find({where: {start_uuid: start_uuid}});
        debug("[job %d] start", job.id, job.parameters);
        worker.process(job.parameters).then(function () {
          self._finishJob(job.id, "done");
        }).catch(function (e) {
          self._finishJob(job.id, "error");
        });
      }

    }
  }
};

JobsQueue.prototype._finishJob = function (jobId, status) {
  var self = this;
  return co(function* () {
    yield Job.update({status: status}, {where: {id: jobId}});
    debug("[job %d] finished with status %s", jobId, status);
    yield self._tryToExecuteJob();
  });
};

JobsQueue.prototype.start = function () {
  var self = this;
  return co(function* () {
    yield self._tryToExecuteJob();
  });
};

module.exports = JobsQueue;
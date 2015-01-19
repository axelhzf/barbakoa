var path = require("path");

module.exports = {
  name: "barbakoa-app",
  port: process.env.PORT || 3000,
  keys: ['some secret hurr'],
  db: {
    username: "root",
    password: "",
    database: "barbakoa-app",
    sync: true,
    forceSync: false
  },
  logs: {
    request: true,
    path: path.join(__dirname, "../../../logs")
  },
  uploads: {
    path: path.join(__dirname, "../../../uploads")
  },
  assets: {
    reload: true,
    cache: false,
    min: false
  },
  errors: {
    debug: true
  },
  path: {
    app: path.join(process.cwd()),
    framework: path.join(process.cwd(), "node_modules", "barbakoa")
  }
};
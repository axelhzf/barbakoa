# barbakoa

Fullstack framework based on [Koa](http://koajs.com/)

See [axelhzf/barbakoa-base-app](https://github.com/axelhzf/barbakoa-base-app) for usage example.

## Installation

```js
npm install barbakoa --save
barbakoa init
```

## Create an application

```js
var barbakoa = require("barbakoa");
var app = new barbakoa();
app.start();
```

## Router

Barbakoa uses [koa-router](https://github.com/alexmingoia/koa-router) internally. The router is exposed via `barbakoa.router`.

```js
var router = barbakoa.router;
router.get("/", function* () {
    this.body = "Hello world";
}
```

## ORM

Barbakoa uses [Sequelize](https://github.com/sequelize/sequelize) for persistence.

Models defined in the folder `app/server/models/` are auto initialized.

### Define a model

```js
var db = require("barbakoa").db;

module.exports = db.define("User", {
  name: db.types.STRING,
  password: db.types.STRING
});
```

[Supported types](http://sequelizejs.com/docs/latest/models#data-types)

Custom types:

* `db.types.URL` : `db.types.STRING(2000)`

### Model usage

```js
var User = require("./models/User");
var router = require("barbakoa").router;

router.get("/api/users", function* () {
  var users = yield User.findAll();
  this.body = {users: users};
});
```

## Request parsing and validation

```js
var router = require("barbakoa").router;
var Joi = require("joi")

var idSchema = Joi.object().keys({
  id: Joi.number().integer().min(0).required()
});

router.get("/api/users/:id", function* () {
  var params = yield this.validateParams(idSchema);
  this.body = yield User.find(params.id)
});

```

Methods:

* `ctx.validateParams(schema)` : validates ctx.params
* `ctx.validateQuery(schema)` : validates ctx.query
* `ctx.validateBody(schema)` : validates ctx.body


## Configuration¡

Barbakoa uses [node-config](https://github.com/lorenwest/node-config)

## Events

```js
barbakoa.on("post-start", function* () {

});
```

Events:

* **pre-start**
* **post-start**


## Gulp

Barbakoa comes with several gulp tasks defined.

Define your `gulpfile` like this to import these tasks

```js
var gulp = require("gulp");
require("barbakoa/gulptasks")(gulp);
```

Tasks:

* `less` : less + autoprefixer
* `jade` : client side templating
* `es6` : es6to5 transformation
* `clean`
* `build`
* `default` : clean + build

## Cli

* `barbakoa dev` : Run app in dev mode. Gulp watch and nodemon for server restart
* `barbakoa test` : Run client and server test
* `barbakoa test-client`
* `barbakoa test-server`
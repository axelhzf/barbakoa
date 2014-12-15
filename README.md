# barbakoa

Fullstack framework based on [Koa](http://koajs.com/)

See [axelhzf/barbakoa-base-app](https://github.com/axelhzf/barbakoa-base-app) for usage example.

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

### Model usage

```js
var User = require("./models/User");
router.get("/api/users", function* () {
  var users = yield User.findAll();
  this.body = {user: user};
});
```


## Gulp

Barbakoa comes with several gulp tasks defined.

Define your `gulpfile` like this to import this tasks

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
* `default`



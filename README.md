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
### Model class methods

[http://sequelize.readthedocs.org/en/latest/docs/models/](http://sequelize.readthedocs.org/en/latest/docs/models/)

```js
project = Project.build({
  title: 'my awesome project',
  description: 'woot woot. this will make me a rich man'
})
task = Task.create({ title: 'foo', description: 'bar', deadline: new Date() })
User.create({ username: 'barfooz', isAdmin: true }, [ 'username' ]) //filter properties


// search for one element
Project.find(123)
Project.find({ where: {title: 'aProject'} })
Project.find({
  where: {title: 'aProject'},
  attributes: ['id', ['name', 'title']]
})

User
  .findOrCreate({where: {username: 'sdepold'}, defaults: {job: 'Technical Lead JavaScript'}})
  .spread(function(user, created) {})
  
  
Project.findAndCountAll({where: { title: { $like: 'foo%'}}, offset: 10, limit: 2 })
  
Project.findAll()
Project.findAll({ where: ["id > ?", 25] })
  
Project.findAll({
  where: {
    id: {
      $gt: 6,                // id > 6
      $gte: 6,               // id >= 6
      $lt: 10,               // id < 10
      $lte: 10,              // id
      $ne: 20,               // id != 20
      $not: 3,               // id NOT 3
      $between: [6, 10],     // BETWEEN 6 AND 10
      $notBetween: [11, 15], // NOT BETWEEN 11 AND 15
      $in: [1, 2],           // IN [1, 2]
      $like: '%hat',         // LIKE '%hat'
      $notLike: '%hat'       // NOT LIKE '%hat'
      $iLike: '%hat'         // ILIKE '%hat' (case insensitive)
      $notILike: '%hat'      // NOT ILIKE '%hat'
      $overlap: [1, 2]       // && [1, 2] (PG array overlap operator)
      $contains: [1, 2]      // @> [1, 2] (PG array contains operator)
      $contained: [1, 2]     // <@ [1, 2] (PG array contained by operator)
    }
  }
})  
  
Project.find({
  where: { name: 'a project', $or: [{ id: [1,2,3] }, { id: { $gt: 10 } }]}
})

Project.findAll({ offset: 10, limit: 2 })
Project.findAll({order: 'title DESC'})
Project.findAll({group: 'name'})

Project.count({ where: ["id > ?", 25] })
Project.max('age')
Project.min('age')
Project.sum('age')

//eager loading
Task.findAll({ include: [ User ] })
User.findAll({ include: [{ model: Tool, as: 'Instruments' }] })


//bulk methods
User.bulkCreate([
  { username: 'barfooz', isAdmin: true },
  { username: 'foo', isAdmin: true }
])

User.bulkCreate([
  { username: 'foo' },
  { username: 'bar', admin: true}
], { fields: ['username'] })

Task.update(
  { status: 'inactive' }, 
  { where: { subject: 'programming' }}
)

Task.destroy({ where: {subject: 'programming'}})

Task.destroy({}, {truncate: true})

```


### Model instance methods

[http://sequelize.readthedocs.org/en/latest/docs/instances/](http://sequelize.readthedocs.org/en/latest/docs/instances/)

```js
project.save()
task.updateAttributes({title: 'a very different title now'})
task.destroy()
person.reload()
user.increment('my-integer-field')
user.increment('my-integer-field', 2)
user.decrement('my-integer-field')
```

### Migrations

Write your migrations in `migrations` folder

```js
module.exports = {
  up: function* (migration, types) {
    yield migration.addIndex(
        'Votes', 
        ['UserId', 'SelfieId', "daysFromStart"], 
        {
            indexName: 'SuperDuperIndex',
            indicesType: 'UNIQUE' 
        }
    );
  },
  down: function () {

  }
};
```

#### Migration methods

[http://sequelize.readthedocs.org/en/latest/docs/migrations/](http://sequelize.readthedocs.org/en/latest/docs/migrations/)

* `createTable(tableName, attributes, options)`
* `dropTable(tableName)`
* `dropAllTables()`
* `renameTable(before, after)`
* `showAllTables()`
* `describeTable(tableName)`
* `addColumn(tableName, attributeName, dataTypeOrOptions)`
* `removeColumn(tableName, attributeName)`
* `changeColumn(tableName, attributeName, dataTypeOrOptions)`
* `renameColumn(tableName, attrNameBefore, attrNameAfter)`
* `addIndex(tableName, attributes, options)` 
* `removeIndex(tableName, indexNameOrAttributes)`


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

## CLI

* `barbakoa dev` : Run app in dev mode. Gulp watch and nodemon for server restart
* `barbakoa test` : Run client and server test
* `barbakoa test-client`
* `barbakoa test-server`
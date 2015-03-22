var koa = require('koa'),
  route = require('koa-route'),
  logger = require('koa-logger'),
  bodyparser = require('koa-bodyparser'),
  debug = require('debug')('awesome-request-tests')

// export the server so it can be started externally
debug('creating server')
var server = module.exports = koa()

// middleware
debug('setting up middleware')
if (server.env === 'development')
  server.use(logger())
server.use(bodyparser())

// routes
debug('setting up routes')
server.use(route.get('/', index))
function* index () {
  this.body = 'Welcome!'
}

// setting foo on server for test hackery
var foo = server.foo = {
  list: [],

  index: function* index () {
    this.body = foo.list
  },

  create: function* create () {
    try {
      var item = yield fooifyObject(this.request.body)
      foo.list.push(item)
      this.status = 201
      this.body = item
    } catch (err) {
      this.throw(422, `This is why we can't have nice things`)
    }
  },

  destroy: function* destroy () {
    var id
    try {
      id = this.request.body.id
      if (typeof id !== 'number' || id < 0 || id >= foo.list.length)
        throw new Error()
    } catch (err) {
      this.throw(422, 'Must send a valid id')
    }

    foo.list.splice(id, 1)
    this.status = 204
  }
}

server.use(route.get('/foo', foo.index))
server.use(route.post('/foo', foo.create))
server.use(route.delete('/foo', foo.destroy))

// server initializer
server.init = function init (port=3000) {
  debug('initializing server')
  server.server = server.listen(port, () => debug(`listening on port ${port}`))
  return server.server
}

// initialize server if file is called directly
if (require.main === module)
  server.init()

// add 'foo' to each value in an object
function fooifyObject (obj) {
  return new Promise((resolve) => {
    if (!obj || typeof obj !== 'object')
      throw new Error('Not an object')

    var result = {}
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'object')
        result[key] = JSON.stringify(obj[key])
      else
        result[key] = obj[key]

      result[key] += 'foo'
    })
    resolve(result)
  })
}

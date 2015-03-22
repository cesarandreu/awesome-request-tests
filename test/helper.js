var supertest = require('supertest-as-promised'),
  server = require('../server')

var request = supertest(server.callback())

module.exports = {
  request,
  server
}

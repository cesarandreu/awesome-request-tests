var {expect} = require('chai'),
  {server, request} = require('./helper')

describe('Requests', function () {
  var res

  // Reset list before each test
  beforeEach(function () {
    server.foo.list = []
  })

  describe('GET /', function () {
    it('should return 200 and welcome message', function* () {
      yield request.get('/').expect(200, 'Welcome!')
    })
  })

  describe('GET /foo', function () {
    it('should return 200', function* () {
      yield request.get('/foo').expect(200)
    })

    it('should return foo.list', function* () {
      res = yield request.get('/foo')
      expect(res.body).to.have.length(0)

      server.foo.list.push(1, 2, 3)
      res = yield request.get('/foo')
      expect(res.body).to.deep.equal([1, 2, 3])

      server.foo.list = []
      res = yield request.get('/foo')
      expect(res.body).to.have.length(0)
    })
  })

  describe('POST /foo', function () {
    it('should return 201 on success', function* () {
      yield request.post('/foo').send({}).expect(201)
    })

    it('should let you fooify an object with any key type', function* () {
      res = yield request.post('/foo').send({
        array: [],
        number: 1,
        object: {},
        null: null,
        string: 'string'
      })
      expect(res.body).to.deep.equal({
        array: '[]foo',
        number: '1foo',
        object: '{}foo',
        null: 'nullfoo',
        string: 'stringfoo'
      })
    })

    it('should get added to foo.list', function* () {
      res = yield request.post('/foo').send({object: {}})
      expect(res.body).to.deep.equal(server.foo.list[0])
      expect(server.foo.list).to.have.length(1)
    })

    it('should return 422 on invalid input', function* () {
      yield request.post('/foo').send(null).expect(422, `This is why we can't have nice things`)
      expect(server.foo.list).to.have.length(0)
    })
  })

  describe('DELETE /foo', function () {
    beforeEach(function () {
      server.foo.list.push(1)
    })

    it('should return 204 on success', function* () {
      yield request.del('/foo').send({id: 0}).expect(204)
    })

    it('should remove the item from foo.list', function* () {
      yield request.del('/foo').send({id: 0})
      expect(server.foo.list).to.have.length(0)
    })

    it('should return 422 on invalid input', function* () {
      var inputs = [null, {}, {id: null}, {id: -1}, {id: 1}, {id: '0'}]
      yield inputs.map(id => request.del('/foo').send(id).expect(422, `Must send a valid id`))
      expect(server.foo.list).to.have.length(1)
    })

  })

})

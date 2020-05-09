const mongoose = require('mongoose')
const { expect } = require('chai')
const sinon = require('sinon')

const User = require('../models/user')
const AuthController = require('../controllers/auth')

/**
 * Tests Auth Controller Functions
 */
describe('Auth Controller Login', () => {
  before(done => {
    mongoose
      .connect(
        'mongodb+srv://nodejs-admin:qBOxLeQ6aXqH9R6@kevan0-hi7gv.mongodb.net/nodejs-test',
        { useNewUrlParser: true, useUnifiedTopology: true }
      )
      .then(result => {
        const user = new User({ 
          _id: '5c0f66b979af55031b34728a',
          email: 'test@test.com', 
          password: 'tester', 
          name: 'test', 
          posts: []
        })

        return user.save()
      })
      .then(() => done())
  })

  after(done => {
    User.deleteMany({})
      .then(() => mongoose.disconnect())
      .then(() => done())
  })

  it('should throw an error if db access fails', (done) => {
    sinon.stub(User, 'findOne')
    User.findOne.throws()

    const req = {
      body: { email: 'kevan@test.com', password: 'password1' }
    }

    AuthController.login(req, {}, () => {})
      .then(result => {
        expect(result).to.be.an('error')
        expect(result).to.have.property('statusCode', 500)
        done()
      })

    User.findOne.restore()
  })

  it('should send a response with a valid user status for an existing user', (done) => {
    const req = { userId: '5c0f66b979af55031b34728a' }
    const res = { 
      statusCode: 500, 
      userStatus: null, 
      status: function(code) {
        this.statusCode = code
        return this
      },
      json: function(data) {
        this.userStatus = data.status
      }
    }

    AuthController.getUserStatus(req, res, () => {})
      .then(() => {
        expect(res.statusCode).to.be.equal(200)
        expect(res.userStatus).to.be.equal('I am new!')
        done()
      })
  })
})
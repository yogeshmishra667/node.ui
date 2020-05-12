const mongoose = require('mongoose')
const { expect } = require('chai')

const FeedController = require('../controllers/feed')
const User = require('../models/user')

/**
 * Tests Feed Controller Functions
 */
describe('Feed Controller', () => {
  before(done => {
    mongoose
      .connect('', { 
        useNewUrlParser: true, useUnifiedTopology: true 
      })
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

  it('should add a created post to the posts of the creator', done => {
    const req = {
      body: {
        title: 'Test Post',
        content: 'This is a test post'
      },
      file: {
        path: 'abc'
      },
      userId: '5c0f66b979af55031b34728a'
    }

    const res = {
      status: function() {
        return this
      },
      json: () => {}
    }

    FeedController.createPost(req, res, () => {})
      .then(savedUser => {
        expect(savedUser).to.have.property('posts')
        expect(savedUser.posts).to.have.length(1)
        done()
      })
  })
})

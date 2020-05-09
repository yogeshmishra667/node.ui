const jwt = require('jsonwebtoken')
const { expect } = require('chai')
const sinon = require('sinon')

const authMiddleware = require('../middleware/is-auth')

/**
 * Tests Auth Middleware Function
 */
describe('Auth Middleware', () => {
  it('should throw error if no authorisation error is present', () => {
    const req = {
      get: function() { return null }
    }
    
    expect(authMiddleware.bind(this, req, {}, () => {}))
      .to.throw('Not authenticated.')
  })

  it('should throw an error if the authorisation header is only 1 string', () => {
    const req = {
      get: function() { 
        return 'xyz'
      }
    }

    expect(authMiddleware.bind(this, req, {}, () => {}))
      .to.throw()
  })

  it('should throw an error if the token cannot be verified', () => {
    const req = {
      get: function() { 
        return 'Bearer xyz'
      }
    }

    sinon.stub(jwt, 'verify')
    jwt.verify.returns({ userId: 'abc' })

    authMiddleware(req, {}, () => {})
    expect(req).to.have.property('userId')
    expect(req).to.have.property('userId', 'abc')

    jwt.verify.restore()
  })
})
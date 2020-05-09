const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const { clearImage } = require('../util/file')

const User = require('../models/user')
const Post = require('../models/post')

module.exports = {
  async createUser({ userInput }, req) {
    const { email, name, password } = userInput

    const errors = []

    if (!validator.isEmail(email)) {
      errors.push({
        message: 'Email is invalid'
      })
    }

    if (validator.isEmpty(password) || 
        !validator.isLength(password, { min: 5 })) {
      errors.push({
        message: 'Password too short'
      })
    }

    if (errors.length > 0) {
      const error = new Error('Invalid input')
      error.data = errors
      error.code = 422
      throw error
    }

    const existing = await User.findOne({ email: email })

    if (existing) {
      const error = new Error('User already exists')
      throw error
    }

    const hashed = await bcrypt.hash(password, 12)

    const user = new User({
      password: hashed,
      email: email,
      name: name
    })

    const result = await user.save()

    return { ...result._doc, _id: result._id.toString() }
  },

  async login({ email, password }, req) {
    const errors = []

    if (!validator.isEmail(email)) {
      errors.push({
        message: 'Invalid username'
      })
    }

    if (validator.isEmpty(password) || 
        !validator.isLength(password, { min: 5 })) {
      errors.push({
        message: 'Password too short'
      })
    }

    if (errors.length > 0) {
      const error = new Error('Invalid input')
      error.data = errors
      error.code = 422
      throw error
    }

    const user = await User.findOne({ email: email })
    
    if (!user) {
      const error = new Error('No user found')
      error.code = 401
      throw error
    }

    const isAuthenticated = await bcrypt.compare(password, user.password)
  
    if (!isAuthenticated) {
      const error = new Error('Incorrect email or password')
      error.code = 401
      throw error
    }
  
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, name: user.name }, 
      'nodejsjwttokensecret', 
      { expiresIn: '1h' }
    )
  
    return { userId: user._id.toString(), token: token }
  },

  async createPost({ postInput }, req) {
    if (!req.isAuth) {
      const error = new Error('Not authenticated')
      error.code = 401
      throw error
    }

    const { title, content, imageUrl } = postInput

    const errors = []

    if (validator.isEmpty(title) ||
        !validator.isLength(title, { min: 5 })) {
      errors.push({
        message: 'Title is too short'
      })
    }

    if (validator.isEmpty(content) || 
        !validator.isLength(content, { min: 5 })) {
      errors.push({
        message: 'Content is too short'
      })
    }

    if (errors.length > 0) {
      const error = new Error('Invalid input')
      error.data = errors
      error.code = 422
      throw error
    }

    const user = await User.findById(req.userId)
    if (!user) {
      const error = new Error('Invalid user')
      error.code = 401
      throw error
    }

    const post = new Post({
      title: title, 
      content: content,
      imageUrl: imageUrl,
      creator: user
    })

    const result = await post.save()

    user.posts.push(post)
    await user.save()

    return { 
      ...result._doc, 
      _id: result._id.toString(),
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString()
    }
  },

  async updatePost({ postId, postInput }, req) {
    if (!req.isAuth) {
      const error = new Error('Not authenticated')
      error.code = 401
      throw error
    }

    const { title, content, imageUrl } = postInput

    const errors = []

    if (validator.isEmpty(title) ||
        !validator.isLength(title, { min: 5 })) {
      errors.push({
        message: 'Title is too short'
      })
    }

    if (validator.isEmpty(content) || 
        !validator.isLength(content, { min: 5 })) {
      errors.push({
        message: 'Content is too short'
      })
    }

    if (errors.length > 0) {
      const error = new Error('Invalid input')
      error.data = errors
      error.code = 422
      throw error
    }

    const post = await Post
    .findById(postId)
    .populate('creator')

    if (!post) {
      const error = new Error('No post found')
      error.statusCode = 422
      throw error
    }

    if (post.creator._id.toString() !== req.userId.toString()) {
      const error = new Error('Not authorized')
      error.statusCode = 403
      throw error
    }

    post.title = title
    post.content = content

    if (imageUrl !== 'undefined') {
      post.imageUrl = imageUrl
    }

    const result = await post.save()

    return {
      ...result._doc, 
      _id: result._id.toString(),
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString()
    }
  },

  async deletePost({ postId }, req) {
    if (!req.isAuth) {
      const error = new Error('Not authenticated')
      error.code = 401
      throw error
    }

    const post = await Post.findById(postId)

    if (!post) {
      const error = new Error('Post not found')
      error.statusCode = 404
      throw error
    }

    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not authorized')
      error.statusCode = 403
      throw error
    }

    await Post.deleteOne({ _id: postId })

    clearImage(post.imageUrl)

    const user = await User.findById(req.userId)
    user.posts.pull(postId)

    await user.save()

    return true
  },

  async posts({ page }, req) {
    if (!req.isAuth) {
      const error = new Error('Not authenticated')
      error.code = 401
      throw error
    }

    if (!page) {
      page = 1
    }

    const perPage = 2

    const totalPosts = await Post
      .find()
      .countDocuments()

    const posts = await Post
      .find()
      .populate('creator')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)

    const mapped = posts.map(post => ({
      ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }))

    return {
      posts: mapped,
      totalPosts: totalPosts
    }
  },

  async post({ postId }, req) {
    if (!req.isAuth) {
      const error = new Error('Not authenticated')
      error.code = 401
      throw error
    }

    const post = await Post
      .findById(postId)
      .populate('creator')

    if (!post) {
      const error = new Error('Post not found')
      error.statusCode = 404
      throw error
    }

    return {
      ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }
  },

  async user(data, req) {
    if (!req.isAuth) {
      const error = new Error('Not authenticated')
      error.code = 401
      throw error
    }

    const user = await User.findById(req.userId)

    if (!user) {
      const error = new Error('User not found')
      error.statusCode = 404
      throw error
    }

    return {
      ...user._doc,
      _id: user._id.toString()
    }
  },

  async updateStatus({ status }, req) {
    if (!req.isAuth) {
      const error = new Error('Not authenticated')
      error.code = 401
      throw error
    }

    const user = await User.findById(req.userId)

    if (!user) {
      const error = new Error('User not found')
      error.statusCode = 404
      throw error
    }

    user.status = status

    await user.save()

    return {
      ...user._doc,
      _id: user._id.toString()
    }
  }
}

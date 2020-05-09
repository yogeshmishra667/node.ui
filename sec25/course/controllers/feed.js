const path = require('path')
const fs = require('fs')

const { validationResult } = require('express-validator')

const Post = require('../models/post')
const User = require('../models/user')

const clearImage = file => {
  filePath = path.join(__dirname, '..', file)
  fs.unlink(filePath, (error) => {
    if (error) {
      throw (error);
    }
  });
}

exports.getPosts = (req, res, next) => {
  const page = req.query.page || 1

  const perPage = 2

  let totalItems

  Post.find()
    .countDocuments()
    .then(count => {
      totalItems = count

      return Post.find()
        .skip((page - 1) * perPage)
        .limit(perPage)
    })
    .then(posts => {
      res
        .status(200)
        .json({
          message: 'Fetch all posts successful',
          posts: posts,
          totalItems: totalItems
        })
    })
    .catch(error => {
      if (!error.statusCode) {
        error.statusCode = 500
      }

      next(error)
    })
}

exports.getPost = (req, res, next) => {
  const { postId } = req.params
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Post not found')
        error.statusCode = 404
        throw error
      }

      res
        .status(200)
        .json({
          message: 'Fetch post successful',
          post: post
        })
    })
    .catch(error => {
      if (!error.statusCode) {
        error.statusCode = 500
      }

      next(error)
    })
}

exports.createPost = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed')
    error.statusCode = 422
    throw error
  }

  if (!req.file) {
    const error = new Error('No image found')
    error.statusCode = 422
    throw error
  }

  const { title, content } = req.body
  const { path } = req.file

  const post = new Post({
    title: title, 
    content: content,
    imageUrl: path,
    creator: req.userId
  })

  post.save()
    .then(() => {
      return User.findById(req.userId)
    })
    .then(user => {
      user.posts.push(post)
      return user.save()
    })
    .then(result => {
      res
        .status(201)
        .json({
          message: 'Post created successfully',
          post: post,
          creator: { 
            _id: result._id, 
            name: result.name 
          }
        })
    })
    .catch(error => {
      if (!error.statusCode) {
        error.statusCode = 500
      }

      next(error)
    })
}

exports.updatePost = (req, res, next) => {
  const { postId } = req.params

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed')
    error.statusCode = 422
    throw error
  }

  const { title, content, image } = req.body

  const imageUrl = (req.file)
    ? req.file.path
    : image

  if (!imageUrl) {
    const error = new Error('No image found')
    error.statusCode = 422
    throw error
  }

  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('No post found')
        error.statusCode = 422
        throw error
      }

      if (post.creator.toString() !== req.userId) {
        const error = new Error('Not authorized')
        error.statusCode = 403
        throw error
      }

      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl)
      }

      post.title = title
      post.content = content
      post.imageUrl = imageUrl

      return post.save()
    })
    .then(result => {
      res
        .status(200)
        .json({
          message: 'Post updated successfully',
          post: result
        })
    })
    .catch(error => {
      if (!error.statusCode) {
        error.statusCode = 500
      }

      next(error)
    })
}

exports.deletePost = (req, res, next) => {
  const { postId } = req.params

  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('No post found to delete')
        error.statusCode = 422
        throw error
      }

      if (post.creator.toString() !== req.userId) {
        const error = new Error('Not authorized')
        error.statusCode = 403
        throw error
      }

      if (post.imageUrl) {
        clearImage(post.imageUrl)
      }

      return Post.deleteOne({ _id: postId })
    })
    .then(result => {
      return User.findById(req.userId)
    })
    .then(user => {
      user.posts.pull(postId)

      return user.save()
    })
    .then(result => {
      res
        .status(200)
        .json({
          message: 'Post deleted successfully',
          post: result
        })
    })
    .catch(error => {
      if (!error.statusCode) {
        error.statusCode = 500
      }

      next(error)
    })
}

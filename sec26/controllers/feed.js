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

exports.getPosts = async (req, res, next) => {
  const page = req.query.page || 1

  const perPage = 2

  try {
    const totalItems = await Post
      .find()
      .countDocuments()

    const posts = await Post
      .find()
      .populate('creator')
      .skip((page - 1) * perPage)
      .limit(perPage)

    res.status(200)
      .json({
        message: 'Fetch all posts successful',
        posts: posts,
        totalItems: totalItems
      })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500
    }

    next(error)
  }
}

exports.getPost = async (req, res, next) => {
  const { postId } = req.params

  try {
    const post = await Post.findById(postId)

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
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500
    }

    next(error)
  }
}

exports.createPost = async (req, res, next) => {
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

  try {
    await post.save()

    const user = await User.findById(req.userId)
    user.posts.push(post)
    await user.save()

    res
      .status(201)
      .json({
        message: 'Post created successfully',
        post: post,
        creator: { 
          _id: user._id, 
          name: user.name 
        }
      })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500
    }

    next(error)
  }
}

exports.updatePost = async (req, res, next) => {
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

  try {
    const post = await Post.findById(postId)

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

    const result = await post.save()

    res
      .status(200)
      .json({
        message: 'Post updated successfully',
        post: result
      })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500
    }

    next(error)
  }
}

exports.deletePost = async (req, res, next) => {
  const { postId } = req.params

  try {
    const post = await Post.findById(postId)

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

    if (post.imageUrl) {
      clearImage(post.imageUrl)
    }

    await Post.deleteOne({ _id: postId })

    const user = await User.findById(req.userId)
    user.posts.pull(postId)

    await user.save()

    res
      .status(200)
      .json({
        message: 'Post deleted successfully'
      })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500
    }

    next(error)
  }
}

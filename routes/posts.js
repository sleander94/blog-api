const express = require('express');
const router = express.Router();
const Post = require('../models/post')
const postController = require('../controllers/postController')

// List of all posts
router.get('/', postController.posts_get);

router.post('/', (req, res, next) => {
  let post = new Post({
    author: 'Bob',
    timestamp: new Date().toLocaleDateString(),
    title: 'I\'m cool',
    text: 'What a neat API',
    isPublic: false
  })
  post.save((err) => {
    if (err) {
      return next(err)
    }
  })
})

module.exports = router;

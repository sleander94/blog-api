const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController')

// List of all posts
router.get('/', postController.posts_get);
router.get('/:id', postController.post_get)
router.post('/', postController.posts_post)
router.delete('/:id', postController.post_delete)
router.put('/:id', postController.post_update)

module.exports = router;

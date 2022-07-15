const express = require('express');
const router = express.Router();
const post_controller = require('../controllers/postController');
const comment_controller = require('../controllers/commentController');

router.get('/', post_controller.posts_get);
router.get('/:id', post_controller.post_get);
router.post('/', post_controller.posts_post);
router.delete('/:id', post_controller.post_delete);
router.put('/:id', post_controller.post_update);

router.post('/:id', comment_controller.comment_post);

module.exports = router;

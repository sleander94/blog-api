const Comment = require('../models/comment');
const { body } = require('express-validator');
const async = require('async');

exports.comment_post = [
  body('author', 'Enter your name').trim().isLength({ min: 1 }).escape(),
  body('text', 'Comment text is empty').trim().isLength({ min: 1 }).escape(),
  (req, res, next) => {
    const comment = new Comment({
      author: req.body.author,
      timestamp: new Date().toLocaleDateString(),
      text: req.body.text,
      post: req.params.id,
    });
    comment.save((err) => {
      if (err) {
        return next(err);
      } else {
        res.redirect(`/posts/${comment.post}`);
      }
    });
  },
];

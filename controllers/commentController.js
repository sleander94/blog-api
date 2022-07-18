const Comment = require('../models/comment');
const { body, validationResult } = require('express-validator');
const passport = require('passport');

exports.comment_post = [
  body('text', 'Comment text is empty').trim().isLength({ min: 1 }).escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({
          message: 'You need to be logged in to comment.',
        });
      }
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Enter a comment before submitting',
        });
      }
      const comment = new Comment({
        author: user.firstname + ' ' + user.lastname,
        authorId: user._id,
        timestamp: new Date().toLocaleDateString(),
        text: req.body.text,
        post: req.params.id,
      });
      comment.save((err) => {
        if (err) {
          return next(err);
        }
        return res
          .status(200)
          .json({ message: 'Comment created successfully.' });
      });
    })(req, res, next);
  },
];

exports.comment_delete = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        message: 'You need to be logged in to delete comments.',
      });
    }
    Comment.findById(req.params.commentId).exec((err, results) => {
      if (err) {
        return next(err);
      }
      if (!results.authorId.equals(user._id)) {
        return res.status(401).json({
          message: 'You can only delete your own comments.',
        });
      }
      Comment.findByIdAndDelete(req.params.commentId, (err) => {
        if (err) {
          return next(err);
        }
        return res
          .status(200)
          .json({ message: 'Comment deleted successfully.' });
      });
    });
  })(req, res, next);
};

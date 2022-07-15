const Comment = require('../models/comment');
const { body, validationResult } = require('express-validator');
const passport = require('passport');

exports.comment_post = [
  body('text', 'Comment text is empty').trim().isLength({ min: 1 }).escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    passport.authenticate('jwt', { session: false }, (err, user) => {
      console.log('hey');
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({
          message: 'Auth Failed: You need to be logged in to post.',
        });
      }
      if (!errors.isEmpty()) {
        res.status(400).json(errors);
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
        } else {
          res.redirect(`/posts/${comment.post}`);
        }
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
        message: 'Auth Failed: You need to be logged in to update posts.',
      });
    }
    Comment.findById(req.params.commentId).exec((err, results) => {
      if (err) {
        return next(err);
      }
      if (!results.authorId.equals(user._id)) {
        return res.status(400).json({
          message: 'Auth Failed: You can only delete your own posts.',
        });
      }
      Comment.findByIdAndDelete(req.params.commentId, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect(`/posts/${results.post}`);
      });
    });
  })(req, res, next);
};

const Post = require('../models/post');
const Comment = require('../models/comment');
const { body, validationResult } = require('express-validator');
const async = require('async');
const passport = require('passport');

exports.posts_get = (req, res, next) => {
  Post.find({ isPublic: true }).exec((err, results) => {
    if (err) {
      return next(err);
    }
    res.json(results);
  });
};

exports.posts_post = [
  body('title', 'Enter a title').trim().isLength({ min: 1 }).escape(),
  body('problem', 'Post text is empty').trim().isLength({ min: 1 }).escape(),
  body('solution', 'Post text is empty').trim().isLength({ min: 1 }).escape(),
  body('adminPass', 'Wrong password')
    .trim()
    .equals(process.env.ADMIN_PASS)
    .escape(),
  (req, res, next) => {
    console.log(process.env.ADMIN_PASS);
    const errors = validationResult(req);
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({
          message: 'You need to be logged in to post.',
        });
      }
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation error' });
      }
      const post = new Post({
        author: user.firstname + ' ' + user.lastname,
        authorId: user._id,
        timestamp: new Date().toLocaleDateString(),
        title: req.body.title,
        problem: req.body.problem,
        solution: req.body.solution,
        adminPass: req.body.adminPass,
      });
      post.save((err) => {
        if (err) {
          return next(err);
        }
        return res.status(200).json({ message: 'Post created successfully.' });
      });
    })(req, res, next);
  },
];

exports.post_get = (req, res, next) => {
  async.parallel(
    {
      post: (cb) => {
        Post.findOne({ _id: req.params.id }, cb);
      },
      comments: (cb) => {
        Comment.find({ post: req.params.id }, cb);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.status(200).json(results);
    }
  );
};

exports.post_delete = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        message: 'You need to be logged in to update posts.',
      });
    }
    Post.findById(req.params.id).exec((err, results) => {
      if (err) {
        return next(err);
      }
      if (!results.authorId.equals(user._id)) {
        return res.status(401).json({
          message: 'You can only delete your own posts.',
        });
      }
      Post.findByIdAndDelete(req.params.id, (err) => {
        if (err) {
          return next(err);
        }
        return res.status(200).json({ message: 'Post deleted successfully.' });
      });
    });
  })(req, res, next);
};

exports.post_update = [
  body('title', 'Enter a title').trim().isLength({ min: 1 }).escape(),
  body('problem', 'Post text is empty').trim().isLength({ min: 1 }).escape(),
  body('solution', 'Post text is empty').trim().isLength({ min: 1 }).escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({
          message: 'You need to be logged in to update posts.',
        });
      }
      if (!errors.isEmpty()) {
        res.status(400).json({ message: errors });
      }
      const post = new Post({
        _id: req.params.id,
        author: user.firstname + ' ' + user.lastname,
        authorId: user._id,
        timestamp: new Date().toLocaleDateString(),
        title: req.body.title,
        problem: req.body.problem,
        solution: req.body.solution,
      });
      Post.findById(req.params.id).exec((err, results) => {
        if (err) {
          return next(err);
        }
        if (!results.authorId.equals(user._id)) {
          return res.status(401).json({
            message: 'You can only update your own posts.',
          });
        }
        Post.findByIdAndUpdate(req.params.id, post, {}, (err) => {
          if (err) {
            return next(err);
          }
          return res
            .status(200)
            .json({ message: 'Post updated successfully.' });
        });
      });
    })(req, res, next);
  },
];

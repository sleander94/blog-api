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
  body('text', 'Post text is empty').trim().isLength({ min: 1 }).escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({
          message: 'Auth Failed',
          reason: 'You need to be logged in to post',
        });
      }
      if (!errors.isEmpty()) {
        res.status(404).json(errors);
      }
      const post = new Post({
        author: user.firstname + ' ' + user.lastname,
        authorId: user._id,
        timestamp: new Date().toLocaleDateString(),
        title: req.body.title,
        text: req.body.text,
        isPublic: req.body.isPublic,
      });
      post.save((err) => {
        if (err) {
          return next(err);
        }
        res.redirect(`/posts/${post._id}`);
      });
    })(req, res, next);
  },
];

exports.post_get = (req, res, next) => {
  async.parallel(
    {
      post: (cb) => {
        Post.find({ _id: req.params.id }, cb);
      },
      comments: (cb) => {
        Comment.find({ post: req.params.id }, cb);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.json(results);
    }
  );
};

exports.post_delete = (req, res, next) => {
  Post.findByIdAndDelete(req.params.id, (err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/posts');
  });
};

exports.post_update = [
  body('title', 'Enter a title').trim().isLength({ min: 1 }).escape(),
  body('text', 'Post text is empty').trim().isLength({ min: 1 }).escape(),
  (req, res, next) => {
    const post = new Post({
      _id: req.params.id,
      author: 'Stephen Leander',
      timestamp: new Date().toLocaleDateString(),
      title: req.body.title,
      text: req.body.text,
      isPublic: req.body.isPublic,
    });
    Post.findByIdAndUpdate(req.params.id, post, {}, (err) => {
      if (err) {
        return next(err);
      } else {
        res.redirect(`/posts/${post._id}`);
      }
    });
  },
];

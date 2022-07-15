const Post = require('../models/post');
const Comment = require('../models/comment');
const { body, validationResult } = require('express-validator');
const async = require('async');

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
    /*   const errors = validationResult(req); */

    const post = new Post({
      author: 'Stephen Leander',
      timestamp: new Date().toLocaleDateString(),
      title: req.body.title,
      text: req.body.text,
      isPublic: req.body.isPublic,
    });
    /*   if (!errors.isEmpty()) {
    if (err) {
      return next(err)
    }
    res.redirect('/posts/new-post')
  } */
    post.save((err) => {
      if (err) {
        return next(err);
      } else {
        res.redirect(`/posts/${post._id}`);
      }
    });
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

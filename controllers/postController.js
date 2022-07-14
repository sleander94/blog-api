const Post = require('../models/post')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const async = require('async')

exports.posts_get = (req, res, next) => {
  Post.find({isPublic: true}).exec((err, results) => {
    if (err) {
      return next(err)
    }
    res.json(results)
  }) 

  } 

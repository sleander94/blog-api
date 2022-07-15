require('dotenv').config();
const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const async = require('async');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const bcrypt = require('bcryptjs');

exports.signup_post = [
  body('firstname', 'Firstname is required')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('lastname', 'Lastname is required').trim().isLength({ min: 1 }).escape(),
  body('email', 'Enter a valid email').trim().escape(),
  body('password', 'Password must be 5 or more characters')
    .isLength({ min: 5 })
    .escape(),
  body('confirm-password').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),

  (req, res, next) => {
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      const user = new User({
        firstname:
          req.body.firstname.charAt(0).toUpperCase() +
          req.body.firstname.slice(1),
        lastname:
          req.body.lastname.charAt(0).toUpperCase() +
          req.body.lastname.slice(1),
        email: req.body.email,
        password: hashedPassword,
      });
      User.findOne({ email: user.email }).exec((err, results) => {
        if (err) {
          return next(err);
        }
        if (results !== null) {
          user.password = req.body.password;
          return res.status(400).json({
            message: 'Email is already in use',
            user: user,
          });
        } else {
          user.save((err) => {
            if (err) {
              return next(err);
            }
            res.send('Created new user');
          });
        }
      });
    });
  },
];

exports.login_post = (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: 'Auth Failed' });
    }
    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }
    });
    const token = jwt.sign({ email: req.body.email }, process.env.JWT_SECRET);
    return res.status(200).json({
      message: 'Auth Passed',
      token,
      user,
    });
  })(req, res, next);
};

exports.protected = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: 'Auth Failed' });
    }
    return res.status(200).json({
      message: 'Yay, an authorized route!',
    });
  })(req, res, next);
};

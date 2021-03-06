require('dotenv').config();
const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const bcrypt = require('bcryptjs');

exports.signup_post = [
  body('firstname', 'Firstname is required')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('lastname', 'Lastname is required').trim().isLength({ min: 1 }).escape(),
  body('email', 'Enter a valid email').trim().isEmail().escape(),
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
    const errors = validationResult(req);
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      const user = new User({
        firstname: req.body.firstname.charAt(0)
          ? req.body.firstname.charAt(0).toUpperCase() +
            req.body.firstname.slice(1)
          : '',
        lastname: req.body.lastname.charAt(0)
          ? req.body.lastname.charAt(0).toUpperCase() +
            req.body.lastname.slice(1)
          : '',
        email: req.body.email,
        password: hashedPassword,
      });
      User.findOne({ email: user.email }).exec((err, results) => {
        if (err) {
          return next(err);
        }
        if (results !== null) {
          user.password = req.body.password;
          return res.status(400).json({ message: 'Email is already in use' });
        }
        if (!errors.isEmpty()) {
          res.status(400).json({ message: 'Validation error.' });
        }
        user.save((err, user) => {
          if (err) {
            return next(err);
          }
          return res
            .status(200)
            .json({ message: 'User created successfully.' });
        });
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
      token,
      user,
    });
  })(req, res, next);
};

exports.logout_post = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        message: 'Auth Failed: Not logged in.',
      });
    }
    res.clearCookie('token');
    res.send('User logged out');
  })(req, res, next);
};

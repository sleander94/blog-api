const express = require('express');
const router = express.Router();

const user_controller = require('../controllers/userController');

router.post('/signup', user_controller.signup_post);
router.post('/login', user_controller.login_post);

module.exports = router;

require('dotenv').config();
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send(process.env.MONGODB_DEVURI)
});

module.exports = router;

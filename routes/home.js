var express = require('express');
var Tasklist = require('../models/tasklist');
var router = express.Router();

var authenticate = function(req, res, next) {
  if (req.session.currentUser) {
    next();
  } else {
    res.render('index', { title: 'Productivity', message: 'Please log in!' });
  }
};

router.all('*', authenticate);

/* GET home page */
router.get('/', function(req, res, next) {
  var user = req.session.currentUser;
  Tasklist.find({ username: user.username }, function(err, lists) {
    console.log(lists);
    res.render('home', { title: 'Productivity', username: user.username, tasklists: lists });
  });
});

module.exports = router;
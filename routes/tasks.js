var express = require('express');
var router = express.Router();
var Tasklist = require('../models/tasklist');

var authenticate = function(req, res, next) {
  if (req.session.currentUser) {
    next();
  } else {
    res.render('index', { title: 'Productivity', message: 'Please log in!' });
  }
};

router.all('*', authenticate);

// /* GET home page */
// router.get('/', function(req, res, next) {
//   var user = req.session.currentUser;
//   res.render('home', { title: 'Productivity', username: user.username });
// });

router.get('/create_tasklist', function(req, res, next) {
  res.render('create_tasklist');
});

router.post('/create_tasklist', function(req, res, next) {
  // var 
  // Tasklist.create(req.session.currentUser.username, req.body.listname, )
});

module.exports = router;
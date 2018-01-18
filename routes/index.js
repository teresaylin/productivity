var express = require('express');
var bcrypt = require('bcrypt');
var User = require('../models/user');
var router = express.Router();

/* GET welcome page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Productivity', message: '' });
});

/* GET user's home page. */
router.get('/home', function(req, res, next) {
  res.render('home', { title: 'Productivity', username: '' });
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login', message: '' });
});

/* GET register page. */
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register', message: '' });
});

/* POST login data */
router.post('/login', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  User.authenticate(username, password, function(result) {
    if (result.success) {
      res.redirect('/home');
      //res.render('home', { title: 'Productivity', username: username });
    } else {
      res.render('login', { title: 'Login', message: result.message });
    }
  });
});

/* POST register data */
router.post('/register', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var password_confirm = req.body.password_confirm;

  User.register(username, password, password_confirm, function(result) {
    if (result.success) {
      res.redirect('/login');
      //res.render('login', { title: 'Login', message: 'Registration successful! Please login.' });
    } else {
      res.render('register', { title: 'Register', message: result.message });
    }
  });
});

module.exports = router;

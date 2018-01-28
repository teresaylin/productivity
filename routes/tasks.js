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

/* GET tasklist page */
router.get('/create_tasklist', function(req, res, next) {
  res.render('create_tasklist', { message: '' });
});

/* POST tasklist data */
router.post('/create_tasklist', function(req, res, next) {
  var username = req.session.currentUser.username;
  tasks = [];
  var data = req.body;    // {listname: 'errands', task0: 'groceries', task1: 'shop'}
  for(var item in data) {
    if(item.includes("task")) {
      tasks.push(data[item]);
    }
  }
  Tasklist.create(username, req.body.listname, tasks, function(result) {
    if (result.success) {
      Tasklist.find({ username: username }, function(err, lists) {
        console.log(lists);
        res.render('home', { title: 'Productivity', username: username, tasklists: lists });
      });
    } else {
      // TODO save data, re-render same page with data, and message
      res.render('create_tasklist', { message: result.message });
    }
  });
});

module.exports = router;
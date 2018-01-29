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
  var tasks_dict = {};          // {0: [task0, time0], 1: [task1, time1]}
  var data = req.body;          // {listname: 'errands', task0: 'groceries', task1: 'shop', time0: '2018-02-10T15:12'}
  for(var item in data) {
    if(item.includes("task")) {
      var index = item.substring(4);
      var task = data[item];
      tasks_dict[index] = [];
      tasks_dict[index].push(task);      
    }
  }
  for(var item in data) {
    if(item.includes("time")) {
      var index = item.substring(4);
      var deadline = data[item];
      tasks_dict[index].push(deadline);
    }
  }

  var tasks = Object.keys(tasks_dict).map(function(index) {
    return tasks_dict[index];
  });

  Tasklist.create(username, req.body.listname, tasks, function(result) {
    if (result.success) {
      Tasklist.find({ username: username }, function(err, lists) {
        res.render('home', { title: 'Productivity', username: username, tasklists: lists });
      });
    } else {
      // TODO save data, re-render same page with data, and message
      res.render('create_tasklist', { message: result.message });
    }
  });
});

module.exports = router;
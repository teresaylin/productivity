var express = require('express');
var mongoose = require('mongoose');
var Tasklist = require('../models/tasklist');
var Task = require('../models/task');
var router = express.Router();
var ObjectId = mongoose.Types.ObjectId;

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
    res.render('home', { title: 'Productivity', username: user.username, tasklists: lists, message: '' });
  });
});

/* GET a tasklist page */
router.get('/:listname', function(req, res, next) {
  var user = req.session.currentUser;
  var listname = req.params.listname;

  Tasklist.find({ username: user.username }, function(err, lists) {
    var correct_list;
    lists.forEach(function(list) {
      if(list.listname === listname) {
        correct_list = list;
      }
    });

    var promises = correct_list.tasks.map(function(task) {
      return new Promise(function(resolve, reject) {
        var taskId = new ObjectId(task);
        Task.findOne({'_id': taskId}, function(err, task_obj) {
          if(task_obj) {
            resolve(task_obj);
          } else {
            reject(err);
          }
        });
      });
    });

    Promise.all(promises).then(function(data) {
      var task_objects = data;
      res.render('tasklist', { title: correct_list.listname, tasklists: lists, thislist: correct_list, tasks: task_objects });
    }, function(err) {
      var errorMsg = 'Error fetching tasks for list: ' + correct_list.listname;
      res.render('home', { title: 'Productivity', username: user.username, tasklists: lists, message: errorMsg });
    });
  });
});


module.exports = router;
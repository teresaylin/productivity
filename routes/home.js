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
router.get('/:listname/:environment?', function(req, res, next) {
  var user = req.session.currentUser;
  var listname = req.params.listname;
  var environments = new Set(['neutral', 'calm', 'motivational', 'depressing', 'stressful']);
  var env = req.params.environment; // a String or undefined
  var valid = environments.has(env);

  Tasklist.find({ username: user.username }, function(err, lists) {
    var correct_list;
    lists.forEach(function(list) {
      if(list.listname === listname) {
        correct_list = list;
      }
    });

    // list does not exist -> home page w/error msg
    // list exists, environment not valid -> home page w/error msg
    // list exists, environment valid -> go to environment page
    // list exists, environment undefined -> go to list page
    if(!correct_list) {
      // if the user does not have such a list
      res.render('home', { title: 'Productivity', username: user.username, tasklists: lists, message: 'Sorry, no such page exists. Please choose a tasklist from the Projects menu.' });
    } else if(typeof env !== 'undefined' && !valid) {
      // environment is defined but does not exist
      res.render('home', { title: 'Productivity', username: user.username, tasklists: lists, message: 'Sorry, no such page exists. Please go back to /home and choose a tasklist from the side menu and an environment from the dropdown.' });
    } else {
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
        if(typeof env === 'undefined') {
          // go to lists page
          res.render('tasklist', { title: correct_list.listname, tasklists: lists, thislist: correct_list, tasks: task_objects });
        } else {
          // go to environment page
          res.render(env, { title: listname + ' | ' + env, listname: listname, tasks: task_objects });
        }
      }, function(err) {
        var errorMsg = 'Error fetching tasks for list: ' + correct_list.listname;
        res.render('home', { title: 'Productivity', username: user.username, tasklists: lists, message: errorMsg });
      });
    }
  });
});

module.exports = router;
var mongoose = require('mongoose');
var Task = require('./task')
var User = require('./user')

var tasklistSchema = new mongoose.Schema({
  username: { type: String, required: true, ref: 'User' },
  //username: { type: userSchema, required: true },
  listname: { type: String, required: true, index: { unique: true } },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],   /* [Task object id] */
  emotion: { type: String }   //TODO may need to modify
});

/*
 * Handler for creating a new task list.
 * cb expects an object with 2 fields:
 *   success: if creation of tasklist was successful
 *   message: feedback message for user
 */
tasklistSchema.statics.create = function(username, listname, listoftasks, cb) {  
  User.findOne({'username': username}, function(err, user) {
    if (user == null) {
      cb({ success: false, message: 'User does not exist!' });
    } 

    Tasklist.findOne({'username': username, 'listname': listname}, function(err, tasklist) {
      if (tasklist) {
        cb({ success: false, message: 'You have another list with the same name. Please choose a different name!' });
      } else {
        var new_list = new Tasklist({
          username: username,
          listname: listname,
          tasks: [],
          emotion: ''
        });

        var promises = listoftasks.map(function(task) {
          return new Promise(function(resolve, reject) {
            // for each task, create a Task object
            Task.create(new_list._id, task, function(result) {
              if (result.success) {
                resolve(result.task_obj);
              } else {
                reject(new Error('Task failed to save: ' + task));
              }
            });
          });
        });

        Promise.all(promises).then(function(data) {
          // all promises have resolved
          // data is a list of Task objects
          new_list.tasks = data;
          new_list.save(function(err) {
            //add new_list to user's list of tasklists
            User.addList(username, new_list, function(result) {
              if(result.success) {
                cb({ success: true, message: 'Tasklist successfully saved!' });
              } else {
                cb({ success: false, message: 'Tasklist failed to save :(' });
              }
            });
          });
        }, function(err) {
          // at least one promise was rejected
          cb({ success: false, message: 'Tasklist failed to save due to a faulty task. Please check your tasks.' });
        });
      }
    });
  });
};

/*
 * Handler for saving/updating an existing task list.
 * 
 */
tasklistSchema.statics.update = function(username, listname, listoftasks, cb) {
  // TODO
  // find list with same listname and username
  // go through list of tasks and take out bad ones (weird characters, '', etc)
  // save
  
};


var Tasklist = mongoose.model('Tasklist', tasklistSchema);

module.exports = Tasklist;
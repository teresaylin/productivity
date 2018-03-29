var mongoose = require('mongoose');
var Tasklist = require('./tasklist');

var taskSchema = new mongoose.Schema({
  list: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Tasklist' },  /* id tasklist that this task belongs to */
  objective: { type: String, required: true },
  completed: { type: Boolean, default: false },
  deadline: { type: Date }
}, {
  timestamps: true
});

taskSchema.statics.create = function(listid, task, deadline, cb) {
  var new_task = new Task({
    list: listid,
    objective: task,
    deadline: deadline
  });
  new_task.save(function(err) {
    if (err) {
      cb({success: false, task_obj: null});
    }
    cb({success: true, task_obj: new_task});
  });
};

// Update task to have 'completed' = true
taskSchema.statics.markComplete = function(listid, task, cb) {
  Task.update({ list: listid, objective: task, completed: false }, {$set: { completed: true }}, function(err) {
    if (err) {
      console.log(err);
      cb({ success: false });
    }
    cb({ success: true });
  });
};

var Task = mongoose.model('Task', taskSchema);
module.exports = Task;
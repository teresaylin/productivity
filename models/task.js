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

// TODO taskSchema.statics.create = function(listid, task, deadline, cb) {
taskSchema.statics.create = function(listid, task, cb) {
  // TODO check for completion of tasks
  var new_task = new Task({
    list: listid,
    objective: task
  });
  new_task.save(function(err) {
    if (err) {
      cb({success: false, task_obj: null});
    }
    cb({success: true, task_obj: new_task});
  });
};

taskSchema.statics.update = function(listid, task, completed, deadline, cb) {
  // TODO
};

var Task = mongoose.model('Task', taskSchema);
module.exports = Task;
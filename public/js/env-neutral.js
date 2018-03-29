var intervalId = null;

$(function() {
  // in "Right now" dropdown, format each task deadline
  $('.taskobj').each(function(index, element) {
    var children = $(element).children();
    var complete = $(children[2]).text();
    var date = $(children[1]).text();
    var date_formatted = moment(date).format('h:mm a MMM D, YYYY');
    $(children[1]).text(date_formatted);
    var now = new Date().getTime();
    var diff = new Date(date).getTime() - now;
    if(diff <= 0 || complete == 'true') {
      $(element).hide();
    }
  });

  // position tasks and their checkboxes
  var taskWidth = $('.tasksOnBar').width();
  var checkWidth = $('.checkbox').outerWidth(true); //includes margin and padding
  var checkHeight = $('.checkbox').outerHeight(true);
  var taskLeft = ($(window).width() - taskWidth - checkWidth)/2 + checkWidth;
  var checkLeft = ($(window).width() - taskWidth - checkWidth)/2;

  $('.tasksOnBar').each(function(index, element) {
    var children = $(element).children();
    var taskId = $(element).attr('id').slice(4);
    var taskHeight = $('.tasksOnBar').outerHeight(true);
    var complete = $(children[2]).text();
    var date = $(children[1]).text();
    var now = new Date().getTime();
    var diff = new Date(date).getTime() - now;
    var informaldate = $(children[3]);
    var date_formatted = moment(date).format('h:mm a MMM D');
    var separation = 100;
    var startingTop = 100;

    $(element).css('top', separation*index + startingTop);
    $(element).css('left', taskLeft);
    informaldate.text(date_formatted);
    $('#'+'check'+taskId).css('top', separation*index + startingTop + (taskHeight - checkHeight)/2);
    $('#'+'check'+taskId).css('left', checkLeft);

    if(diff <= 0) {
      $(element).css('text-decoration', 'line-through');
      $(element).css('font-style', 'italic');
    } else if(complete == 'true') {
      $(element).css('text-decoration', 'line-through');
      $(element).css('font-style', 'italic');
      $(element).css('background-color', '#6ed06e');
    }
  });

  // TODO if all tasks are completed

});

// Once user selects a task, starts the clock
$(document).on("click", ".taskobj", function() {
  var children = $(this).children();
  var task = $(children[0]).text();
  var date = $(children[1]).text();
  $('.dropdownTasks').hide();

  $('#workingOn').text('Working on: ' + task);

  // mark selected task as 'current', highlight current task, and show tasks
  var foundCurrent = false;   // in case there are 2 identical tasks
  $('.tasksOnBar').each(function(index, element) {
    var children = $(element).children();
    var sideTask = children[0];
    var bgcolor = $(element).css('background-color');
    var taskId = $(element).attr('id').slice(4);    // task11 -> 11
    if($(sideTask).text() === task && !foundCurrent && bgcolor !== 'rgb(110, 208, 110)') {
      $(element).addClass('current');
      foundCurrent = true;
    } else {
      $(element).removeClass('current');
    }
    $(element).css('display', 'inline-flex'); // puts deadline and task on the same line
    $(element).show();
    $('#'+'check'+taskId).show();
  });
});

// TODO when user clicks on a different task, switch to that task

// TODO when user checks off a task

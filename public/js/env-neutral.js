$(function() {
  var numTasks = $('.tasksOnBar').length;
  $('.dropdownTasks').css('display', 'inline-block');
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
  var taskWidth = $('.tasksOnBar').outerWidth(true);
  var checkWidth = $('.checkbox').outerWidth(true); //includes margin and padding
  var checkHeight = $('.checkbox').outerHeight(true);
  var taskLeft = ($(window).width() - taskWidth - checkWidth)/2 + checkWidth;
  var checkLeft = ($(window).width() - taskWidth - checkWidth)/2;

  $('.tasksOnBar').each(function(index, element) {
    var children = $(element).children();
    var taskId = $(element).attr('id').slice(4);
    var checkbox = $('#'+'cbox'+taskId);
    var checkmark = $('#'+'cmark'+taskId);
    var taskHeight = $('.tasksOnBar').outerHeight(true);
    var complete = $(children[2]).text();
    var date = $(children[1]).text();
    var now = new Date().getTime();
    var diff = new Date(date).getTime() - now;
    var informaldate = $(children[3]);
    var date_formatted = moment(date).format('h:mm a MMM D');
    var separation = 100;
    var startingTop = 150;

    $(element).css('top', separation*index + startingTop);
    $(element).css('left', taskLeft);
    informaldate.text(date_formatted);
    checkbox.css('top', separation*index + startingTop + (taskHeight - checkHeight)/2);
    checkbox.css('left', checkLeft);

    if(diff <= 0) {
      $(element).addClass('saved expired');
      checkmark.show();
    } else if(complete == 'true') {
      $(element).addClass('saved checked');
      checkmark.show();
    }
  });

  // position listname
  var listWidth = $('#currentList').width();
  var taskRight = taskLeft + taskWidth;
  var taskMiddle = (taskLeft + taskRight)/2;
  $('#currentList').css('left', taskMiddle - listWidth/2);

  // position save button
  $('#savetasks').css('left', taskMiddle - $('#savetasks').outerWidth(true)/2);

  // if all tasks are completed
  if($('.saved').length === numTasks) {
    $('.dropdownTasks').hide();
    $('#currentList').show();
    $('.tasksOnBar').each(function(index, element) {
      var taskId = $(element).attr('id').slice(4);    // task11 -> 11
      $(element).css('display', 'inline-flex');
      $(element).show();
      $('#'+'cbox'+taskId).show();
    });
  }
});

// Once user selects a task, starts the clock
$(document).on("click", ".taskobj", function() {
  var children = $(this).children();
  var task = $(children[0]).text();
  var date = $(children[1]).text();
  $('.dropdownTasks').hide();

  $('#currentList').show();
  $('#savetasks').show();
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
    $('#'+'cbox'+taskId).show();
  });
});

// when user clicks on a different task, switch to that task
$(document).on("click", ".tasksOnBar", function() {
  var element = this;
  var textdecoration = $(this).css('text-decoration');
  var currentTaskDiv = $('.current');

  if(!textdecoration.includes('line-through')) {
    // update which task is the currently selected one
    currentTaskDiv.removeClass('current');
    $(element).addClass('current');

    // update the current task
    var children = $(element).children();
    var task = $(children[0]).text();
    $('#workingOn').text('Working on: ' + task);
  }
});

// when user checks off a task
$(document).on("click", ".checkbox", function() {
  var index = $(this).attr('id').slice(4);  // cbox11 -> 11
  var checkmark = $('#'+'cmark'+index);
  var taskElement = $('#'+'task'+index);

  // only toggle if task has not been saved
  if(!taskElement.hasClass('saved')) {
    taskElement.toggleClass('checked');
    if(taskElement.hasClass('checked')) {
      checkmark.show();
    } else {
      checkmark.hide();
    }
  }

  // if '.current' task is checked, then switch current to another
  if($('.current').hasClass('checked')) {
    var currentDiv = $('.current');
    currentDiv.removeClass('current');
    var switched = false;
    $('.tasksOnBar').each(function(index, element) {
      if(!$(element).hasClass('checked') && !$(element).hasClass('saved') && !switched) {
        $(element).addClass('current');
        switched = true;
      }
    });
  }
});

// when user clicks on save button
$(document).on("click", "#savetasks", function() {
  var currentListLen = $('#currentList').text().length;
  var listname = $('#currentList').text().slice(1,currentListLen-1);    // '"listname"' -> 'listname'
  var completedTasks = [];

  $('.checked').each(function(index, element) {
    var children = $(element).children();
    var taskname = $(children[0]).text();
    completedTasks.push(taskname);
  });

  $.ajax({
    url: '/home/' + listname + '/complete/list',
    type: 'POST',
    data: {
      listname: listname,
      listtasks: JSON.stringify(completedTasks)
    },
    success: function(data) {
      location.reload();
    },
    error: function(xhr, status, error) {
      location.reload();
    }
  });
});
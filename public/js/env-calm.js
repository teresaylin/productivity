var intervalId = null;
// TODO make canvas positioning (X coords) more flexible to different window sizes
// TODO make current task the first yellow dot

$(function() {
  var numTasks = $('.tasksOnBar').length;
  var numFinished = 0;
  var numUnfinished = 1;

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

  // draw the path
  var path = new BezierDrawer($('#path')[0], false, 0);
  path.setTesselationCount(numTasks);
  taskDots = path.getTesselationPoints();

  // position task dots based on finished (expired + completed) or unfinished
  $('.tasksOnBar').each(function(index, element) {
    var children = $(element).children();
    var dot = children[3];
    var border = children[4];
    var flag = children[5];
    var complete = $(children[2]).text();
    var date = $(children[1]).text();
    var now = new Date().getTime();
    var diff = new Date(date).getTime() - now;

    var canvasTop = parseFloat($('#path').css('top').slice(0,-2));

    if(diff <= 0 || complete == 'true') {
      // put towards beginning of path
      $(dot).css('background-color', 'green');
      $(dot).css('left', taskDots[numFinished].x);
      $(dot).css('top', canvasTop + taskDots[numFinished].y - 4);
      $(border).css('left', taskDots[numFinished].x - 2);
      $(border).css('top', canvasTop + taskDots[numFinished].y - 6);
      $(border).css('background-color', '#4c4c4d');

      // position flag
      var dotTop = parseFloat($(dot).css('top').slice(0,-2));
      var dotLeft = parseFloat($(dot).css('left').slice(0,-2));
      var flagHeight = $(flag).height();
      $(flag).css('top', dotTop - flagHeight);
      $(flag).css('left', dotLeft);

      numFinished++;
    } else {
      // put towards end of path
      $(dot).css('left', taskDots[numTasks - numUnfinished].x);
      $(dot).css('top', canvasTop + taskDots[numTasks - numUnfinished].y - 4);
      $(border).css('left', taskDots[numTasks - numUnfinished].x - 2);
      $(border).css('top', canvasTop + taskDots[numTasks - numUnfinished].y - 6);
      numUnfinished++;
    }
  });

  // TODO IF NO TASKS LEFT

  // check every 10 seconds to see if the clock is still ticking
  setInterval(checkClock, 10000);
});

// Once user selects a task, starts the clock
$(document).on("click", ".taskobj", function() {
  var children = $(this).children();
  var task = $(children[0]).text();
  var date = $(children[1]).text();
  $('.dropdownTasks').hide();

  $('#workingOn').text('FINISH ' + task + ' BY ' + date);
  $('#workingOn').show();
  $('#path').show();
  $('#finishedCircleDiv').show();
  $('.tasksOnBar').each(function(index, element) {
    var children = $(element).children();
    var dot = children[3];
    var dotborder = children[4];
    var flag = children[5];
    $(dot).show();
    $(dotborder).show();
    if($(dot).css('background-color') === 'rgb(0, 128, 0)') {
      $(flag).removeClass('hideflag');
    }
  });

  // implement countdown
  var deadline = new Date(date).getTime();
  intervalId = setInterval(function() { 
    startClock(deadline);
  }, 1000);
});

// When user hovers on a progress dot, show the task to the left
$(document).on({
  mouseenter: function() {
    var parentTaskDiv = $(this).parent();
    var children = $(parentTaskDiv).children();
    var task = $(children[0]).text();
    var flag = children[5];
    var date = $(children[1]).text();
    var date_formatted = moment(date).format('h:mm a MMM D');

    var dotborder = children[4];
    var dotColor = $(this).css('background-color');
    var dotBottom = parseFloat($(this).css('bottom').slice(0,-2));
    var dotLeft = parseFloat($(this).css('left').slice(0,-2));

    // position flags
    $('#flag-green').css('bottom', dotBottom);
    $('#flag-green').css('left', dotLeft - 5);
    $('#flag-yellow').css('bottom', dotBottom);
    $('#flag-yellow').css('left', dotLeft - 5);

    // position flag text
    var flagTop = dotBottom + $('#flag-green').height();
    var flagLeft = parseFloat($('#flag-green').css('left').slice(0,-2));
    $('#hoverTask').css('bottom',  flagTop - 100);
    $('#hoverTask').css('left', flagLeft + 20);
    $('#hoverTask').text(task + ": " + date_formatted);

    if(dotColor === 'rgb(0, 128, 0)') {
      $(flag).addClass('hideflag comeback');
      $('#flag-green').show();
    } else {
      $('#flag-yellow').show();
    }
  },
  mouseleave: function() {
    var parentTaskDiv = $(this).parent();
    var children = $(parentTaskDiv).children();
    var flag = children[5];
    $('#hoverTask').text('');
    $('#flag-green').hide();
    $('#flag-yellow').hide();
    if($(flag).hasClass('comeback')) {
      $(flag).removeClass('hideflag comeback');
    }
  }
}, "#progressdot");

// When the user clicks on the green checkmark, send update as POST request and reload
$(document).on("click", "#checkmark", function() {
  var listname = $('#currentList').text();
  var text = $('#workingOn').text().split(" ");
  var taskname = text[1];

  var taskdot;
  var taskdotborder;
  $('.tasksOnBar').each(function(index, element) {
    var children = $(element).children();
    var task = children[0];
    var dot = children[3];
    var border = children[4];

    if($(task).text() === taskname) {
      taskdot = dot;
      taskdotborder = border;
    }
  });

  $.ajax({
    url: '/home/' + listname + '/complete',
    type: 'POST',
    data: {
      listname: listname,
      taskname: taskname
    },
    success: function(data) {
      $(taskdot).css('background-color', 'green');
      $(taskdotborder).css('background-color', '#4c4c4d');
      setTimeout(function(){location.reload();}, 3000);
    },
    error: function(xhr, status, error) {
      location.reload();
    }
  });
});

// Display remaining time left
function startClock(deadline) {
  var now = new Date().getTime();
  var diff = deadline - now;
  var days = Math.floor(diff / (1000 * 60 * 60 * 24));
  var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((diff % (1000 * 60)) / 1000);

  // if timer has run out
  if(diff <= 0) {
    $('#days').text(0);
    $('#hours').text(0);
    $('#minutes').text(0);
    $('#seconds').text(0);
  } else {
    $('#days').text(days);
    $('#hours').text(hours);
    $('#minutes').text(minutes);
    $('#seconds').text(seconds);
  }
  // make timer red if < 10 minutes remaining
  if(diff <= 600000) {
    $('.time').css('color', '#ff0000');
  }
  // position entire div in vertical center
  var timerWidth = $('#countdown').width();
  var timerHeight = $('#countdown').height();
  // $('#countdown').css('top', ($(window).height() - timerHeight)/2 - 100);
  $('#countdown').css('top', 0)
  $('#countdown').css('left', ($(window).width() - timerWidth)/2);
  $('#countdown').show();
}

// Check to see if timer has expired, and if so, show the dropdown menu again
function checkClock() {
  if($('#days').text() === '0' && $('#hours').text() === '0' && $('#minutes').text() === '0' && $('#seconds').text() === '0' && intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
    location.reload();
  }
}
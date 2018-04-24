var intervalId = null;
// TODO make canvas positioning (X coords) more flexible to different window sizes

$(function() {
  var numTasks = $('.tasksOnBar').length;
  var numFinished = 0;
  var numUnfinished = 1;
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

  // draw the path
  var path = new BezierDrawer($('#path')[0], false, 0);
  path.setTesselationCount(numTasks);
  taskDots = path.getTesselationPoints();

  var canvasTop = parseFloat($('#path').css('top').slice(0,-2));

  // position 'Last Milestone' text
  var endpt = taskDots[taskDots.length - 1];
  var lastmilestone_width = $('#endpoint').width();
  var lastmilestone_height = $('#endpoint').height();
  $('#endpoint').css('top', canvasTop + endpt.y + 5);
  $('#endpoint').css('left', endpt.x - lastmilestone_width/2);

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

    if(diff <= 0 || complete == 'true') {
      // put towards beginning of path
      $(dot).css('background-color', 'green');
      $(dot).css('left', taskDots[numFinished].x - 6);
      $(dot).css('top', canvasTop + taskDots[numFinished].y - 6);
      $(border).css('left', taskDots[numFinished].x - 8);
      $(border).css('top', canvasTop + taskDots[numFinished].y - 8);
      $(border).css('background-color', '#4c4c4d');
      numFinished++;
    } else {
      // put towards end of path
      $(dot).css('left', taskDots[numTasks - numUnfinished].x - 6);
      $(dot).css('top', canvasTop + taskDots[numTasks - numUnfinished].y - 6);
      $(border).css('left', taskDots[numTasks - numUnfinished].x - 8);
      $(border).css('top', canvasTop + taskDots[numTasks - numUnfinished].y - 8);
      numUnfinished++;
    }

    // position flag
    var dotTop = parseFloat($(dot).css('top').slice(0,-2));
    var dotLeft = parseFloat($(dot).css('left').slice(0,-2));
    var flagHeight = $(flag).height();
    $(flag).css('top', dotTop - flagHeight);
    $(flag).css('left', dotLeft);
  });

  // if no tasks left
  if(numFinished === numTasks) {
    $('.dropdownTasks').hide();
    $('#path').show();

    $('#workingOn').width(400);
    $('#workingOn').height(200);
    $('#workingOn').css('font-size', 30);
    $('#workingOn').css('text-align', 'center');
    $('#workingOn').css('z-index', 2);    // so that the text will not obstruct the first dot
    $('#workingOn').css('top', 50);       // so that the text will not obstruct the first dot
    var workingWidth = $('#workingOn').width();
    $('#workingOn').css('left', ($(window).width() - workingWidth)/2);
    $('#workingOn').text("ALL TASKS COMPLETED");
    $('#workingOn').show();
    $('#endpoint').show();

    $('.tasksOnBar').each(function(index, element) {
      var children = $(element).children();
      var dot = children[3];
      var border = children[4];
      var greenflag = children[5];
      $(dot).show();
      $(border).show();
      $(greenflag).removeClass('hideflag');
    });
  }

  // check every 10 seconds to see if the clock is still ticking
  setInterval(checkClock, 10000);
});

// Once user selects a task, starts the clock
$(document).on("click", ".taskobj", function() {
  var children = $(this).children();
  var task = $(children[0]).text();
  var date = $(children[1]).text();
  var date_formatted = moment(date).format('h:mm a MMM D');
  $('.dropdownTasks').hide();

  $('#workingOn').text('FINISH ' + task + ' BY ' + date_formatted);
  $('#path').show();
  $('#finishedCircleDiv').show();
  $('#endpoint').show();

  var firstYellowDot;
  var firstYellowDotBorder;
  var firstYellowDotFlag;
  $('.tasksOnBar').each(function(index, element) {
    var children = $(element).children();
    var dotTask = children[0];
    var dot = children[3];
    var dotborder = children[4];
    var flag = children[5];
    $(dot).show();
    $(dotborder).show();
    // don't hide small green flag if the dot color is green
    if($(dot).css('background-color') === 'rgb(0, 128, 0)') {
      $(flag).removeClass('hideflag');
    } else { // yellow dot
      if(firstYellowDot) {
        // compare top of first yellow dot to this yellow dot
        var firstYellowDotTop = parseFloat($(firstYellowDot).css('top').slice(0,-2));
        var dotTop = parseFloat($(dot).css('top').slice(0,-2));
        if(firstYellowDotTop > dotTop) {
          firstYellowDot = dot;
          firstYellowDotBorder = dotborder;
          firstYellowDotFlag = flag;
        }
      } else {
        firstYellowDot = dot;
        firstYellowDotBorder = dotborder;
        firstYellowDotFlag = flag;
      }
    }
    // make a note of selected task in the corresponding dot on the progress bar
    if($(dotTask).text() === task) {
      $(element).addClass('current');
    } else {
      $(element).removeClass('current');
    }
  });

  // switch current dot with first yellow dot
  // switch current dot's green flag with first yellow dot's green flag
  var selectedDot = $('.current').children()[3];
  var selectedDotBorder = $('.current').children()[4];
  var selectedDotFlag = $('.current').children()[5];
  var tempDotTop = $(firstYellowDot).css('top');
  var tempDotLeft = $(firstYellowDot).css('left');
  var tempFlagTop = $(firstYellowDotFlag).css('top');
  var tempFlagLeft = $(firstYellowDot).css('left');

  $(firstYellowDot).css('top', $(selectedDot).css('top'));
  $(firstYellowDot).css('left', $(selectedDot).css('left'));
  $(firstYellowDotBorder).css('top', $(selectedDotBorder).css('top'));
  $(firstYellowDotBorder).css('left', $(selectedDotBorder).css('left'));
  $(firstYellowDotFlag).css('top', $(selectedDotFlag).css('top'));
  $(firstYellowDotFlag).css('left', $(selectedDotFlag).css('left'));

  $(selectedDot).css('top', tempDotTop);
  $(selectedDot).css('left', tempDotLeft);
  $(selectedDotBorder).css('top', parseFloat(tempDotTop.slice(0,-2)) - 2);
  $(selectedDotBorder).css('left', parseFloat(tempDotLeft.slice(0,-2)) - 2);
  $(selectedDotFlag).css('top', tempFlagTop);
  $(selectedDotFlag).css('left', tempFlagLeft);

  // position current yellow flag
  $('#flag-yellow-current').css('bottom', $(selectedDot).css('bottom'));
  $('#flag-yellow-current').css('left', parseFloat($(selectedDot).css('left').slice(0,-2)) - 9);
  $('#flag-yellow-current').show();

  // position current flag text
  var flagTop = parseFloat($(selectedDot).css('bottom').slice(0,-2)) + $('#flag-yellow-current').height();
  var flagLeft = parseFloat($('#flag-yellow-current').css('left').slice(0,-2));
  $('#workingOn').css('bottom',  flagTop - 100);
  $('#workingOn').css('left', flagLeft + 20);
  $('#workingOn').show();

  // implement countdown
  var deadline = new Date(date).getTime();
  intervalId = setInterval(function() { 
    startClock(deadline);
  }, 1000);
});

// When user hovers on a progress dot, show the task in a flag
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

    // if dot is not current task, show flags
    // if dot is current task, don't do anything
    if(!$(parentTaskDiv).hasClass('current')) {
      // position flags
      $('#flag-green').css('bottom', dotBottom);
      $('#flag-green').css('left', dotLeft - 9);
      $('#flag-yellow').css('bottom', dotBottom);
      $('#flag-yellow').css('left', dotLeft - 9);

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

// When the user clicks on a progress dot, switch to that task
$(document).on("click", "#progressdot", function() {
  var parentTaskDiv = $(this).parent();
  var dot = $(this);
  var dotBorder = $(parentTaskDiv).children()[4];
  var dotColor = $(this).css('background-color');
  var dotFlag = $(parentTaskDiv).children()[5];
  var currentTaskDiv = $('.current');

  if(dotColor !== 'rgb(0, 128, 0)') {
    $('#flag-yellow-current').fadeOut();
    $('#workingOn').fadeOut();
    $('#flag-yellow-current').fadeIn();
    
    setTimeout(function(){
      // switch dot positions and their mini green flags' positions
      var currentDot = currentTaskDiv.children()[3];
      var currentDotBorder = currentTaskDiv.children()[4];
      var currentDotFlag = currentTaskDiv.children()[5];
      var tempDotTop = $(currentDot).css('top');
      var tempDotLeft = $(currentDot).css('left');
      var tempFlagTop = $(currentDotFlag).css('top');
      var tempFlagLeft = $(currentDotFlag).css('left');

      $(currentDot).css('top', $(dot).css('top'));
      $(currentDot).css('left', $(dot).css('left'));
      $(currentDotBorder).css('top', $(dotBorder).css('top'));
      $(currentDotBorder).css('left', $(dotBorder).css('left'));
      $(currentDotFlag).css('top', $(dotFlag).css('top'));
      $(currentDotFlag).css('left', $(dotFlag).css('left'));

      $(dot).css('top', tempDotTop);
      $(dot).css('left', tempDotLeft);
      $(dotBorder).css('top', parseFloat(tempDotTop.slice(0,-2)) - 2);
      $(dotBorder).css('left', parseFloat(tempDotLeft.slice(0,-2)) - 2);
      $(dotFlag).css('top', tempFlagTop);
      $(dotFlag).css('left', tempFlagLeft);

      // change which taskdiv is current
      currentTaskDiv.removeClass('current');
      $(parentTaskDiv).addClass('current');

      // update the task displayed on the right
      var children = $(parentTaskDiv).children();
      var task = $(children[0]).text();
      var date = $(children[1]).text();
      var date_formatted = moment(date).format('h:mm a MMM D');
      $('#workingOn').text('FINISH ' + task + ' BY ' + date_formatted);

      $('#workingOn').fadeIn();
    }, 1000);
    
    // clear clock and start new countdown
    var deadline = new Date(date).getTime();
    clearInterval(intervalId);
    intervalId = null;
    intervalId = setInterval(function() {
      startClock(deadline);
    }, 1000);
  }
});

// When the user clicks on the green checkmark, send update as POST request and reload
$(document).on("click", "#finishedCircleDiv", function() {
  var listname = $('#currentList').text();
  var taskname = $('#workingOn').text().split("FINISH ")[1].split(" BY")[0];

  var taskdot;
  var taskdotborder;
  var taskflag;
  $('.tasksOnBar').each(function(index, element) {
    var children = $(element).children();
    var task = children[0];
    var dot = children[3];
    var border = children[4];
    var flag = children[5];

    if($(task).text() === taskname) {
      taskdot = dot;
      taskdotborder = border;
      taskflag = flag;
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
      $('#workingOn').fadeOut();
      $('#flag-yellow-current').fadeOut();
      $(taskdot).css('background-color', 'green');
      $(taskdotborder).css('background-color', '#4c4c4d');
      setTimeout(function(){$(taskflag).removeClass('hideflag');}, 1000);
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
  var hours = "0" + Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = "0" + Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = "0" + Math.floor((diff % (1000 * 60)) / 1000);

  // if timer has run out
  if(diff <= 0) {
    // $('#days').text(0);
    $('#hours').text('00');
    $('#minutes').text('00');
    $('#seconds').text('00');
  } else {
    // $('#days').text(days);
    $('#hours').text(hours.substr(hours.length - 2));
    $('#minutes').text(minutes.substr(minutes.length - 2));
    $('#seconds').text(seconds.substr(seconds.length - 2));
  }
  // make timer red if < 10 minutes remaining
  if(diff <= 600000) {
    $('.time').css('color', '#ff0000');
  }
  // position entire div in vertical center
  var timerWidth = $('#countdown').width();
  var timerHeight = $('#countdown').height();
  $('#countdown').css('top', 0)
  $('#countdown').css('left', ($(window).width() - timerWidth)/2);
  $('#countdown').show();
}

// Check to see if timer has expired, and if so, show the dropdown menu again
function checkClock() {
  if($('#hours').text() === '00' && $('#minutes').text() === '00' && $('#seconds').text() === '00' && intervalId !== null) { 
    clearInterval(intervalId);
    intervalId = null;
    location.reload();
  }
}
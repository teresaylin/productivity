var intervalId = null;
var whichSnowman = '#snowman1';
var numTasks;
var numFinished;
var numUnfinished;
var numExpired;

function stage_of_snowman(percentFinished) {
  var snowman = '';
  if(percentFinished >= 0.75) {
    snowman = '#snowman4';
  } else if(percentFinished >= 0.5) {
    snowman = '#snowman3';
  } else if(percentFinished >= 0.25) {
    snowman = '#snowman2';
  } else {
    snowman = '#snowman1';
  }
  return snowman;
}

$(function() {
  numTasks = $('.tasksOnBar').length;
  numFinished = 0; // number of tasks completed and expired
  numUnfinished = 0;
  numExpired = 0;

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

  // Position tasks on the side, make an informal copy of deadline
  $('.tasksOnBar').each(function(index, element) {
    var children = $(element).children();
    var complete = $(children[2]).text();
    var date = $(children[1]).text();
    var now = new Date().getTime();
    var diff = new Date(date).getTime() - now;
    var informaldate = $(children[3]);
    var date_formatted = moment(date).format('h:mm a MMM D');

    // var height = $(element).height();
    var height = 85
    $(element).css('top', (height+15)*index + 100);
    informaldate.text(date_formatted);

    if(diff <= 0) {
      $(element).css('text-decoration', 'line-through');
      $(element).css('font-style', 'italic');
      numExpired++;
    } else if(complete == 'true') {
      $(element).css('text-decoration', 'line-through');
      $(element).css('font-style', 'italic');
      $(element).css('background-color', '#6ed06e');
      numFinished++;
    } else {
      numUnfinished++;
    }
  });

  // set the snowman
  var percentFinished = numFinished/numTasks;
  whichSnowman = stage_of_snowman(percentFinished);

  // set status and position
  $('#status').text(Math.round(percentFinished*100) + '%');
  $('#status').css('top', $(window).height()/2 - $('#status').height());
  $('#status').css('left', $(window).width()/2 - $('#status').width()/4);
  $('#youare').css('top', $(window).height()/2 - $('#status').height() - $('#youare').height());
  $('#youare').css('left', $(window).width()/2 - $('#youare').width()/4);
  $('#done').css('top', $(window).height()/2);
  $('#done').css('left', $(window).width()/2 - $('#done').width()/4);

  // if all tasks are completed
  if(numFinished + numExpired === numTasks) {
    $('.dropdownTasks').hide();
    $(whichSnowman).show();
    $('#youare').text('finished')
    $('#youare').show();
    $('#status').show();
    $('#done').text('of tasks')
    $('#done').show();
    $('.tasksOnBar').each(function(index, element) {
      $(element).css('display', 'inline-flex'); // puts deadline and task on the same line
      $(element).show();
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
  $('.dropdownTasks').hide();

  // show certain elements
  $('#workingOn').text('Working on: ' + task);
  $('#finishedCircleDiv').show();
  $(whichSnowman).show();
  $('#youare').show();
  $('#status').show();
  $('#done').show();

  // mark selected task as 'current', highlight current task, and show tasks
  var foundCurrent = false;   // in case there are 2 identical tasks
  $('.tasksOnBar').each(function(index, element) {
    var children = $(element).children();
    var sideTask = children[0];
    var bgcolor = $(element).css('background-color');
    if($(sideTask).text() === task && !foundCurrent && bgcolor !== 'rgb(110, 208, 110)') {
      $(element).addClass('current');
      foundCurrent = true;
    } else {
      $(element).removeClass('current');
    }
    $(element).css('display', 'inline-flex'); // puts deadline and task on the same line
    $(element).show();
  });

  // implement countdown
  var deadline = new Date(date).getTime();
  intervalId = setInterval(function() { 
    startClock(deadline);
  }, 1000);
});

// when user clicks on a task on a side, switch to that task
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
    var date = $(children[1]).text();
    $('#workingOn').text('Working on: ' + task);

    // clear clock and start new countdown
    var deadline = new Date(date).getTime();
    clearInterval(intervalId);
    intervalId = null;
    intervalId = setInterval(function() {
      startClock(deadline);
    }, 1000);
  }
});

// when user clicks on checkmark
$(document).on("click", "#checkmark", function() {
  var listname = $('#currentList').text();
  var taskname = $('#workingOn').text().slice(12);  // slices off the "Working on: "
  var percentFinished = (numFinished+1)/numTasks;
  var nextSnowman = stage_of_snowman(percentFinished);

  $.ajax({
    url: '/home/' + listname + '/complete',
    type: 'POST',
    data: {
      listname: listname,
      taskname: taskname
    },
    success: function(data) {
      // change task to green
      $('.current').css('text-decoration', 'line-through');
      $('.current').css('font-style', 'italic');
      $('.current').css('background-color', '#6ed06e');
      $('.current').css('border-color', 'gray');
      $('.current').css('color', 'black');
      // update percent done
      $('#status').text(Math.round(percentFinished*100)+'%');
      // update snowman
      $(whichSnowman).fadeOut(750);
      $(nextSnowman).fadeIn(750);
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
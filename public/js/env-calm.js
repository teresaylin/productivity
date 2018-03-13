var intervalId = null;
// TODO make canvas positioning (X coords) more flexible to different window sizes

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

  // position dots based on finished (expired + completed) or unfinished
  $('.tasksOnBar').each(function(index, element) {
    var children = $(element).children();
    var dot = children[3];
    var border = children[4]
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

  // check every 10 seconds to see if the clock is still ticking
  setInterval(checkClock, 10000);
});

// Once user selects a task, starts the clock
$(document).on("click", ".taskobj", function() {
  var children = $(this).children();
  var task = $(children[0]).text();
  var date = $(children[1]).text();
  $('.dropdownTasks').hide();

  // position the 'Working on' text
  $('#workingOn').text('Working on: ' + task);
  var timerWidth = $('#workingOn').width();
  var timerHeight = $('#workingOn').height();
  $('#workingOn').css('top', ($(window).height() - timerHeight)/2 - 200);
  $('#workingOn').css('left', ($(window).width() - timerWidth)/2);
  $('#workingOn').show();

  $('#path').show();
  $('.dots').each(function(index, element) {
    $(element).show();
  });
  $('.dotborder').each(function(index, element) {
    $(element).show();
  });

  // position checkmark button
  var checkmarkSide = $('#finishedCircleDiv').width();
  $('#finishedCircleDiv').show();

  // implement countdown
  var deadline = new Date(date).getTime();
  intervalId = setInterval(function() { 
    startClock(deadline);
  }, 1000);
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
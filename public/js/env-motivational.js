var intervalId = null;
var whichPlant = '#plant1';

$(function() {
  var numTasks = $('.tasksOnBar').length;
  var numFinished = 0; // number of tasks completed and expired
  var numUnfinished = 0;

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

  $('.tasksOnBar').each(function(index, element) {
    var children = $(element).children();
    var dot = children[3];
    var complete = $(children[2]).text();
    var date = $(children[1]).text();
    var now = new Date().getTime();
    var diff = new Date(date).getTime() - now;

    var progressbarTop = parseFloat($('#progressbar').css('top').slice(0,-2));
    var progressbarHeight = $('#progressbar').height();

    if(diff <= 0 || complete == 'true') {
      $(dot).css('background-color', 'green');
      numFinished++;
      $(dot).css('top', progressbarTop + (numTasks-numFinished)/numTasks * progressbarHeight + 4);
    } else {
      $(dot).css('top', progressbarTop + numUnfinished/numTasks * progressbarHeight + 4);
      numUnfinished++;
    }
  });

  // What stage plant is in
  var percentFinished = numFinished / numTasks;
  if(percentFinished >= 0.75) {
    whichPlant = '#plant4';
  } else if(percentFinished >= 0.5) {
    whichPlant = '#plant3';
  } else if(percentFinished >= 0.25) {
    whichPlant = '#plant2';
  } else {
    whichPlant = '#plant1';
  }

  // if no tasks left
  if(numFinished === numTasks) {
    $('.dropdownTasks').hide();
    $('#workingOn').text("CONGRATS, YOU'RE DONE!");
    $('#workingOn').show();
    $('#workingOnDisplay').show();
    $('#progressbar').show();
    $('#fullbloom').show();
    $('.dots').each(function(index, element) {
      $(element).show();
    });
    $(whichPlant).show();
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

  $('#workingOn').text('FINISH ' + task + ' BY ' + date);
  $('#workingOn').show();
  $('#workingOnDisplay').show();
  $('#finishedCircleDiv').show();
  $('#progressbar').show();
  $('#fullbloom').show();
  $('.dots').each(function(index, element) {
    $(element).show();
  });
  $(whichPlant).show();

  // implement countdown
  var deadline = new Date(date).getTime();
  intervalId = setInterval(function() { 
    startClock(deadline);
  }, 1000);

  // make a note of selected task in the corresponding dot on the progress bar
  $('.tasksOnBar').each(function(index, element) {
    var children = $(element).children();
    var dotTask = children[0];
    var dot = children[3];
    if($(dotTask).text() === task) {
      $(element).addClass('current');
      var arrowHeight = $('#progressarrow').height()/2;
      var arrowPos = parseFloat($(dot).css('top').slice(0,-2)) - arrowHeight + 4;
      $('#progressarrow').css('top', arrowPos);
      $('#progressarrow').show();
    } else {
      $(element).removeClass('current');
    }
  });
});

// When the user clicks on a progress dot, switch to that task
$(document).on("click", "#progressdot", function() {
  var parentTaskDiv = $(this).parent();

  // update which progressdot is the currently selected one
  $('.tasksOnBar').each(function(index, element) {
    $(element).removeClass('current');
  });
  $(parentTaskDiv).addClass('current');

  // update the task displayed on the right
  var children = $(parentTaskDiv).children();
  var task = $(children[0]).text();
  var date = $(children[1]).text();
  var date_formatted = moment(date).format('h:mm a MMM D, YYYY');
  $('#workingOn').text('FINISH ' + task + ' BY ' + date_formatted);

  // update progress arrow
  var arrowHeight = $('#progressarrow').height()/2;
  var arrowPos = parseFloat($(this).css('top').slice(0,-2)) - arrowHeight + 4;
  $('#progressarrow').css('top', arrowPos);

  // clear clock and start new countdown
  var deadline = new Date(date).getTime();
  clearInterval(intervalId);
  intervalId = null;
  intervalId = setInterval(function() {
    startClock(deadline);
  }, 1000);
});

// When the user clicks on the green checkmark, send update as POST request and reload
$(document).on("click", "#checkmark", function() {
  var listname = $('#currentList').text();
  var text = $('#workingOn').text().split(" ");
  var taskname = text[1];

  $.ajax({
    url: '/home/' + listname + '/complete',
    type: 'POST',
    data: {
      listname: listname,
      taskname: taskname
    },
    success: function(data) {
      location.reload();
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
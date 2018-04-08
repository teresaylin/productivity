var intervalId = null;
// TODO clicking on task in side list changes timer to that
// TODO when hovering on checkmark, give a hint as to what it does ('Mark as finished!')

$(function() {
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

  var numTasksLeft = 0;
  // format each task deadline on the side menu, label expired with class 'expired'
  $('.taskoption').each(function(index, element) {
    var children = $(element).children();
    var complete = $(children[2]).text();
    var date = $(children[1]).text();
    var now = new Date().getTime();
    var diff = new Date(date).getTime() - now;
    // check if complete, then check if expired
    if(complete == 'true') {
      $(children[0]).addClass('finished');
      $(children[1]).addClass('finished');
    } else if(diff <= 0) {
      $(children[0]).addClass('expired');
      $(children[1]).addClass('expired');
    } else {
      numTasksLeft++;
    }
    var date_formatted = moment(date).format('h:mm a MMM D, YYYY');
    $(children[1]).text(date_formatted);
  });

  // if no tasks left, disable the button
  if(numTasksLeft === 0) {
    $('#taskbtn').text('No more tasks left!');
    $('#taskbtn').removeClass('unfinished');
    $('#taskbtn').addClass('finished');
    $('#taskbtn').prop('disabled', true);
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
  // position the 'Working on' text
  $('#workingOn').text('Working on: ' + task);
  var timerWidth = $('#workingOn').width();
  var timerHeight = $('#workingOn').height();
  $('#workingOn').css('top', ($(window).height() - timerHeight)/2 - 200);
  $('#workingOn').css('left', ($(window).width() - timerWidth)/2);
  $('#workingOn').show();
  // position checkmark button
  var checkmarkSide = $('#finishedCircleDiv').width();
  $('#finishedCircleDiv').css('top', ($(window).height() - checkmarkSide)/2 + 50);
  $('#finishedCircleDiv').css('left', ($(window).width() - checkmarkSide)/2);
  $('#finishedCircleDiv').show();
  // show tasks on the side
  $('.taskoption').each(function(index, element) {
    $(element).show();
  });
  // implement countdown
  var deadline = new Date(date).getTime();
  intervalId = setInterval(function() { 
    startClock(deadline);
  }, 1000);
});

// When the user clicks on the green checkmark, send update as POST request and reload
$(document).on("click", "#checkmark", function() {
  var listname = $('#currentList').text();
  var taskname = $('#workingOn').text().slice(12);

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
    // $('#days').text(0);
    $('#hours').text(0);
    $('#minutes').text(0);
    $('#seconds').text(0);
  } else {
    // $('#days').text(days);
    $('#hours').text(hours);
    $('#minutes').text(minutes);
    $('#seconds').text(seconds);
  }
  // make timer red if < 10 minutes remaining
  if(diff <= 600000) {
    $('.time').css('color', '#f5ff74');
  }
  // position entire div in vertical center
  var timerWidth = $('#countdown').width();
  var timerHeight = $('#countdown').height();
  $('#countdown').css('top', ($(window).height() - timerHeight)/2 - 100);
  $('#countdown').css('left', ($(window).width() - timerWidth)/2);
  $('#countdown').show();
}

// Check to see if timer has expired, and if so, show the dropdown menu again
function checkClock() {
  // if($('#days').text() === '0' && $('#hours').text() === '0' && $('#minutes').text() === '0' && $('#seconds').text() === '0' && intervalId !== null) {
  if($('#hours').text() === '0' && $('#minutes').text() === '0' && $('#seconds').text() === '0' && intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
    location.reload();
  }
}
var intervalId = null;
// TODO clicking on task in side list changes timer to that 
// TODO cross out tasks differently for completed / unfinished
// TODO method for user to mark task as completed before 0:00

$(function() {
  // in "Right now" dropdown, format each task deadline
  $('.taskobj').each(function(index, element) {
    var children = $(element).children();
    var date = $(children[1]).text();
    var date_formatted = moment(date).format('h:mm a MMM D, YYYY');
    $(children[1]).text(date_formatted);
    var now = new Date().getTime();
    var diff = new Date(date).getTime() - now;
    if(diff <= 0) {
      $(element).hide();
    }
  });

  var numTasksLeft = 0;
  // format each task deadline on the side menu, label expired with class 'expired'
  $('.taskoption').each(function(index, element) {
    var children = $(element).children();
    var date = $(children[1]).text();
    var now = new Date().getTime();
    var diff = new Date(date).getTime() - now;
    if(diff <= 0) {
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
  $('#workingOn').text('Working on: ' + task);
  var timerWidth = $('#workingOn').width();
  var timerHeight = $('#workingOn').height();
  $('#workingOn').css('top', ($(window).height() - timerHeight)/2 - 100);
  $('#workingOn').css('left', ($(window).width() - timerWidth)/2);
  $('#workingOn').show();
  // implement countdown
  var deadline = new Date(date).getTime();
  intervalId = setInterval(function() { 
    startClock(deadline);
    console.log('still ticking');
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
    $('.time').css('color', 'red');
  }
  // position entire div in vertical center
  var timerWidth = $('#countdown').width();
  var timerHeight = $('#countdown').height();
  $('#countdown').css('top', ($(window).height() - timerHeight)/2);
  $('#countdown').css('left', ($(window).width() - timerWidth)/2);
  $('#countdown').show();
}

// Check to see if timer has expired, and if so, show the dropdown menu again
function checkClock() {
  if($('#days').text() === '0' && $('#hours').text() === '0' && $('#minutes').text() === '0' && $('#seconds').text() === '0' && intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
    location.reload();
    // $('#countdown').hide();
    // $('.dropdownTasks').show();
  }
}
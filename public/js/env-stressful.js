var intervalId = null;
// TODO change appearance when all tasks are done

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
    var informaldate = $(children[3]);
    var date_formatted = moment(date).format('h:mm a MMM D');

    var height = 60;
    $(element).css('top', (height+15)*index + 100);
    informaldate.text(date_formatted);

    // check if complete, then check if expired
    if(complete == 'true') {
      $(element).css('text-decoration', 'line-through');
      $(element).css('font-style', 'italic');
      $(element).css('background-color', '#6ed06e');
    } else if(diff <= 0) {
      $(element).css('text-decoration', 'line-through');
      $(element).css('font-style', 'italic');
    } else {
      numTasksLeft++;
    }
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
  // mark selected task as 'current', highlight current task, and show tasks
  var foundCurrent = false;   // in case there are 2 identical tasks
  $('.taskoption').each(function(index, element) {
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
$(document).on("click", ".taskoption", function() {
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

// When the user clicks on the green checkmark, send update as POST request and reload
$(document).on("click", "#finishedCircleDiv", function() {
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
      $('.current').css('text-decoration', 'line-through');
      $('.current').css('font-style', 'italic');
      $('.current').css('background-color', '#6ed06e');
      $('.current').css('border-color', 'gray');
      $('.current').css('color', 'black');
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
  if($('#hours').text() === '00' && $('#minutes').text() === '00' && $('#seconds').text() === '00' && intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
    location.reload();
  }
}
var intervalId = null;

$(function() {
  var numUnfinished = 0;
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

  var prevTombTask;
  // Position tasks on the side, make an informal copy of deadline
  $('.tasksOnBar').each(function(index, element) {
    var parent = $(element).parent();
    var tombtask = $(parent).children()[index*2+1];
    var children = $(element).children();
    var complete = $(children[2]).text();
    var date = $(children[1]).text();
    var now = new Date().getTime();
    var diff = new Date(date).getTime() - now;
    var informaldate = $(children[3]);
    var date_formatted = moment(date).format('h:mm a MMM D');

    // parse task text for AT MOST 1 UNREPEATED hyperlink (must use HTTPS protocol)
    var task = children[0];
    var taskText = $(task).text();
    var splitText = taskText.split(' ');
    var link = '';
    splitText.forEach(function(word) {
      if(word.includes('https')) link = word;
    });

    // replace found link with hyperlink
    if(link.length > 0) {
      var splitTextByLink = taskText.split(link);
      var replaceTask = splitTextByLink[0] + "<a href='" + link + "'>" + link + "</a>" + splitTextByLink[1];
      $(task).html(replaceTask);
    }

    var elementHeight = 100;
    // $(element).css('top', elementHeight*index + 100);
    $(element).css('top', elementHeight*index + 160);     /* better for BRL screens */
    informaldate.text(date_formatted);

    // var tombTextTop = 380;
    var tombTextTop = 430;      /* better for BRL screens */
    if(complete == 'true') {
      $(element).css('text-decoration', 'line-through');
      $(element).css('font-style', 'italic');
      $(element).css('background-color', '#6ed06e');
    } else if (diff <= 0) {
      $(element).css('text-decoration', 'line-through');
      $(element).css('font-style', 'italic');

      if(!prevTombTask) {
        $(tombtask).css('top', tombTextTop);
        prevTombTask = tombtask;
      } else {
        var prevTombTaskTop = parseFloat($(prevTombTask).css('top').slice(0,-2));
        var prevTombTaskHeight = $(prevTombTask).height();
        $(tombtask).css('top', prevTombTaskTop + prevTombTaskHeight + 8);
        prevTombTask = tombtask;
      }
      $(tombtask).addClass('expired');
    } else {
      numUnfinished++;
    }
  });

  // if all tasks are completed
  if(numUnfinished === 0) {
    $('.dropdownTasks').hide();
    $('.tasksOnBar').each(function(index, element) {
      $(element).css('display', 'inline-flex'); // puts deadline and task on the same line
      $(element).show();
    });
    $('#graveyard').show();
    $('.expired').each(function(index, element) {
      $(element).show();
    });
    var doneWidth = $('#done').width();
    $('#done').css('left', ($(window).width() - doneWidth)/2);
    $('#done').show();
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

  // mark selected task as 'current', highlight current task, and show tasks
  var foundCurrent = false;   // in case there are 2 identical tasks
  $('.tasksOnBar').each(function(index, element) {
    var children = $(element).children();
    var sideTask = children[0];
    var textdecoration = $(element).css('text-decoration');
    if($(sideTask).text() === task && !foundCurrent && !textdecoration.includes('line-through')) {
      $(element).addClass('current');
      foundCurrent = true;
    } else {
      $(element).removeClass('current');
    }
    $(element).css('display', 'inline-flex'); // puts deadline and task on the same line
    $(element).show();
  });

  $('#graveyard').show();
  $('.expired').each(function(index, element) {
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
$(document).on("click", "#finishedCircleDiv", function() {
  var listname = $('#currentList').text();
  var taskname = $('#workingOn').text().slice(12);  // slices off the "Working on: "

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
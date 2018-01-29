// Add a task to the list
function addTask() {
  var task = $('#newtask').val();
  var deadline = $('#newdeadline').val();
  var deadline_formatted = moment(deadline).format('MMM D, h:mm a');    // ex: Jan 1, 5:08 pm
  var jsDate = moment(deadline).toDate();
  if (task === '') {
    alert("Cannot add empty task");
  } else if (deadline === '') {
    alert("Must fill in full date and time");
  } else {
    // TODO check that date is at least today or later

    var numTasks = $('#tasklist').children().length;
    var newtaskLI = "<li id='task" + numTasks + "'>" + task + "<span id='time" + numTasks + "' class='deadline'>" + deadline_formatted + "</span>" + "<span class='close'>\u00D7</span>" + "</li>";
    $('#tasklist').append(newtaskLI);

    // add a hidden input element so that tasks can be sent via POST request
    var newtaskInput = "<input type='hidden' value='" + task + "' name='task" + numTasks + "' id='inputtask" + numTasks + "'>";
    var newdateInput = "<input type='hidden' value='" + jsDate + "' name='time" + numTasks + "' id='inputtime" + numTasks + "'>";
    $('#taskform').append(newtaskInput);
    $('#taskform').append(newdateInput);
  }
}

// Toggle "checked" class for all <li> elements when clicked
// Toggle "checked" class for corresponding hidden <input> element
$(document).on("click", "li", function() {
  $(this).toggleClass("checked");
  var inputId = 'input' + $(this).attr('id');   //e.g. #inputtask11
  $('#' + inputId).toggleClass("checked");  
});

// Make tasks disappear when the 'x' button is clicked
// Add "removed" class to <li> task element that was removed
$(document).on("click", ".close", function() {
  $(this).parent().css("display", "none");;
  $(this).parent().addClass("removed");
});
// Add a task to the list
function addTask() {
  var task = $('#newtask').val();
  if (task === '') {
    alert("Cannot add empty task");
  } else {
    var numTasks = $('#tasklist').children().length;
    var newtaskLI = "<li id='task" + numTasks + "'>" + task + "<span class='close'>\u00D7</span>" + "</li>";
    $('#tasklist').append(newtaskLI);

    // add a hidden input element so that tasks can be sent via POST request
    var newtaskInput = "<input type='hidden' value='" + task + "' name='task" + numTasks + "' id='inputtask" + numTasks + "'>";
    $('#taskform').append(newtaskInput);
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

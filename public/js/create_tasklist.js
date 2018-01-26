// Add a task to the list
function addTask() {
  var task = $('#newtask').val();
  if (task === '') {
    alert("Cannot add empty task");
  } else {
    var newtaskLI = "<li>" + task + "<span class='close'>\u00D7</span>" + "</li>";
    $('#tasklist').append(newtaskLI);
  }
}

// Toggle "checked" class for all <li> elements when clicked
$(document).on("click", "li", function() {
  $(this).toggleClass("checked");
});

// Make tasks disappear when the 'x' button is clicked
$(document).on("click", ".close", function() {
  console.log($(this).parent());
  $(this).parent().css("display", "none");;
  $(this).parent().addClass("removed");
});

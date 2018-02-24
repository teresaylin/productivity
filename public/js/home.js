// side nav menu functions
function openNav() {
  document.getElementById('mySidenav').style.width = '250px';
  document.body.style.backgroundColor = 'rgba(0,0,0,0.4)';
}

function closeNav() {
  document.getElementById('mySidenav').style.width = '0';
  document.body.style.backgroundColor = 'white';
}

// dropdown menu functions
function drop() {
  $('#myDropdown').toggleClass('show');
}

$(window).click(function(event) {
  if(event.target.className!=='dropbtn' && !$(event.target).hasClass('dropbtntasks')) {
    if($('#myDropdown').hasClass('show')) {
      $('#myDropdown').removeClass('show');
    }
    if($('#dropTasks').hasClass('show')) {
      $('#dropTasks').removeClass('show');
    }
  }
});

function dropTasks() {
  $('#dropTasks').toggleClass('show');
}
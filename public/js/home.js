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
  if(event.target.className!=='dropbtn') {
    if($('#myDropdown').hasClass('show')) {
      console.log('outside of target');
      $('#myDropdown').removeClass('show');
    }
  }
});
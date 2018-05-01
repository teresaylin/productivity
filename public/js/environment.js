// parse task text for AT MOST 1 UNREPEATED hyperlink (must use HTTPS protocol)
function replaceLink(task) {
  var taskText = $(task).text();
  var splitText = taskText.split(' ');
  var link = '';
  splitText.forEach(function(word) {
    if(word.includes('https')) link = word;
  });

  // replace found link with hyperlink
  if(link.length > 0) {
    var splitTextByLink = taskText.split(link);
    var replaceTask = splitTextByLink[0] + "<a target='_blank' href='" + link + "'>" + link + "</a>" + splitTextByLink[1];
    $(task).html(replaceTask);
  }
}

// remind users to check off task
function bounce() {
  // Only bounce checkmark if checkmark is displayed (otherwise bounce effect can change "top" and "left" css of checkmark)
  if($('#finishedCircleDiv').css('display') !== "none") {
    $('#finishedCircleDiv').effect('bounce', {times: 3, distance: -20}, "slow");
  }
  // Only fade in/out reminder if user has selected a task from dropdown
  if(!$('#checkremind').hasClass('hidereminder')) {
    $('#checkremind').fadeIn(600).delay(1000).fadeOut(600);
  }
  
}
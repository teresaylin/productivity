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

// bounces checkmark to remind users
function bounce() {
  $('#finishedCircleDiv').effect('bounce', {times: 3, distance: -20}, "slow");
}
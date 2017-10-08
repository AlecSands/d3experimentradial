console.log('js sourced');

var requestURL = 'data/data.json';
var request = new XMLHttpRequest();
request.open('GET', requestURL);
request.responseType = 'json';
request.send();

request.onload = function() {
  var myData = request.response;
  console.log(myData);
}

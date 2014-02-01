var writer = new Showdown.converter();

var req = new XMLHttpRequest();
req.open('GET', '/post.md', true);
req.send();

req.onload = function() {
  var right = document.getElementsByClassName('right')[0];

  right.innerHTML = writer.makeHtml(this.response);
};

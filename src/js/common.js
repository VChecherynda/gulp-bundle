'use strct'

$(function() {

	(function(d, s, id) {
	  var js,
	      fjs = d.getElementsByTagName(s)[0],
	      t = window.twttr || {};

	  var src= [
	  	  	"https://platform.twitter.com/widgets.js",
	  	  	"https://connect.facebook.net/ru_RU/sdk.js#xfbml=1&version=v2.10"
	  	  ];

	  if (d.getElementById(id)) return t;

	  	  for(var i = 0; i < id.length; i++) {
			  js = d.createElement(s);
			  js.id = id[i];
			  js.src = src[i];
			  fjs.parentNode.insertBefore(js, fjs);
	  	  }

	  return t;
	  
	}(document, "script", ["twitter-wjs","facebook-jssdk"]));

});
$(document).ready(function() {
	var slider;

	$.getJSON("../twitter-slider-example/tweets.json", function(data){	// get posts from local json file
	    var slides = [];
		var placeholderImg = "https://marzloffmedia.com/images/marzloffmedia_logo.png";
		
		for(var i=0;i<data.length;i++){

			// check if metadata exists for the tweet. 
			// If not, there is no media involved so present it with tweet-only styling.
	
			if(propertyExistsAndIsDefined(data[i], "metadata")){
				if(propertyExistsAndIsDefined(data[i].metadata,"image_src") && propertyExistsAndIsDefined(data[i].metadata,"target_url")){
			
			        	content = propertyExistsAndIsDefined(data[i],"url") ?  "<div class=\"tweet_img\"><a href=\""+data[i].url+"\">" : "";
					content += "<img src=\"" + data[i].metadata.image_src + "\" />";
					content += "</a></div>\n<div class=\"tweet_details\"><h3><a href=\""+data[i].url+"\">"+data[i].metadata.title+"</a></h3>\n<p>"+( data[i].summary ? parseURLsInString(data[i].summary) : "") +"</p>\n";
         		
         				if(data[i].status_text.length>0){
           					content += "<div class=\"owner-comment\">"+ parseURLsInString(data[i].status_text) +"</div></div>";
          				}
				}
			}else{
				content = generateTweetOnlyCard(data[i]);
			}
	        	

	        $("#slider").append("<div>"+content+"</div>\n");
	    }

	    slider = $('#slider').leanSlider({
	        directionNav: '#slider-direction-nav',
	        controlNav: '#slider-control-nav',
	        afterChange: function(){
	        }
    	});

    	$('#slider-control-nav').append("<div id=\"slidercaption\">recent twitter posts</div>");
	});

});
function propertyExistsAndIsDefined(obj, prop){
	if(obj.hasOwnProperty(prop)){
		if(obj.prop != '' && obj.prop !== "undefined"){
			return true;
		}else{
			return false;
		}
	}else{
		return false;
	}
}

function generateTweetOnlyCard(tweet){
	var htmlString = '<div class="tweet-only-card"><div class="logo"><img src="img/twitter_logo.png" /></div>'+
					 '<div class="tweet-text"><p>' + tweet.status_text + '</p>';
	if(propertyExistsAndIsDefined(tweet, "metadata")){
		if(propertyExistsAndIsDefined(tweet.metadata, "description")){
			htmlString +=  '<p>' + tweet.metadata.description + '</p>';
		}
	}
	htmlString = parseURLsInString(htmlString);
	htmlString += '</div></div>';

	return htmlString;
}

function parseURLsInString(text) {
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, function(url) {
        return '<a target="twitterlinks" href="' + url + '">' + url + '</a>';
    });
}

var getMeta = require("lets-get-meta"),
         fs = require('fs'),
	   path = require('path'),
	request = require('request'),

  urlExists = require('url-exists'),
      debug = require('debug')('meta_utils');

var preferHTTPS = true;        // If true, will try to get the https link for images to avoid non-SSL material
                               //loading on your personal https domain.

function extractValueFromArrayOfPossibleKeys(data, keys) {
	
	// From a variety of possible keys in object 'data', find and return a value if one exists
	var dataString = '';

	for(a=0; a<keys.length; a++){
		if(data[keys[a]] != undefined && data[keys[a]].length > 0){
			dataString = data[keys[a]];
			break;
		}
	}
	return dataString;
}

function getHttpsLinkIfAvailable(url, linkcallback){
       // This function will check if a url exists (for an image) that is https.
       // You can avoid console warnings by using https requests only from your https site

       if(url == '' || url.includes("https://")){
            // image has no url or already is an https resource. bail!
           return linkcallback(url);

       }else if(url.includes("http://")){
           // try to get the https version
           var prefix = "http://";
           var httpsURL = "https://" + url.substring(url.indexOf(prefix)+ prefix.length);

           urlExists(httpsURL, function(err,exists){
               if(exists){
               		return linkcallback(httpsURL);
               }else{
               		return linkcallback(false);
               }
           });
       }
}


module.exports = {
	
	printObject: function(obj){
		// This is convenience function for logging output of objects nicely
		// console.log("data object:\n" + JSON.stringify(obj, null, '\t') + "\n");
		debug("data object:\n%s\n", JSON.stringify(obj, null, '\t'));
	},

	fetchTagsFromURL: function(url, callback){

		var options = {
			url: url,
			followRedirect: true,
			maxRedirects: 15,
			removeRefererHeader: true,
			headers: {
				'User-Agent': 'curl/7.49.1',	// spoof curl to obtain the target link
				accept: '*/*'	
			}
		};

		request.get(options, function(err, response, body){

			if(!err && response.statusCode == 200){

				var data = getMeta(body);

				// module.exports.printObject(data); // Uncmoment to log object created from metadata
				
				var metaObject = {
					title: extractValueFromArrayOfPossibleKeys(data, ['title', 'twitter:title']),
					description: extractValueFromArrayOfPossibleKeys(data, ['description', 'twitter:description']),
					image_src: extractValueFromArrayOfPossibleKeys(data, ['twitter:image:src', 'twitter:image', 'image', 'sailthru.image.full']),
					target_url: extractValueFromArrayOfPossibleKeys(data, ['url', 'twitter:url'])
				}

				/*if(preferHTTPS){
                    getHttpsLinkIfAvailable(metaObject.image_src,function(newURL){
               			if(newURL && newURL != metaObject.image_src){
                            metaObject.image_src = newURL;
                        }
                        return callback(metaObject);
                        
                    });

               	}else{*/
               		return callback(metaObject);
               	//}
	


			}else {
				console.log("Error requesting URL. " + err);
				return callback({status_code: err});
			}
		});

	}
}


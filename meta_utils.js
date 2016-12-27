var getMeta = require("lets-get-meta"),
         fs = require('fs'),
	   path = require('path'),
	request = require('request');


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

module.exports = {

	printObject: function(obj){
		// This is convenience function for logging output of objects nicely
		console.log("data object:\n" + JSON.stringify(obj, null, '\t') + "\n");
	},

	fetchTagsFromURL: function(url, callback){

		var options = {
			url: url,
			followRedirect: true,
			maxRedirects: 5,
			removeRefererHeader: true,
			headers: {
				'User-Agent': 'curl/7.49.1',	// spoof curl to obtain the target link
				accept: '*/*'	
			}
		};

		request.get(options, function(err, response, body){

			if(!err && response.statusCode == 200){

				var data = getMeta(body);

				// module.exports.printObject(data); // Show object created of all data
				
				var metaObject = {
					title: extractValueFromArrayOfPossibleKeys(data, ['title', 'twitter:title']),
					description: extractValueFromArrayOfPossibleKeys(data, ['description', 'twitter:description']),
					image_src: extractValueFromArrayOfPossibleKeys(data, ['twitter:image:src', 'twitter:image', 'image', 'sailthru.image.full']),
					target_url: extractValueFromArrayOfPossibleKeys(data, ['url', 'twitter:url'])
				}

				callback(metaObject);

			}else {
				callback({status_code: response.status_code});
			}
		});

	}
}


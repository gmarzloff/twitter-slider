var getMeta = require("lets-get-meta"),
         fs = require('fs'),
	   path = require('path'),
	request = require('request');


module.exports = {

	printObject: function(obj){
		// This is convenience function for logging output of objects nicely
		console.log("getMeta data:\n" + JSON.stringify(obj, null, '\t') + "\n");
	},

	fetchTagsFromURL: function(url, callback){

		var options = {
			url: url,
			followRedirect: true,
			maxRedirects: 2,
			removeRefererHeader: true,
			headers: {
				'User-Agent': 'curl/7.49.1',	// spoof curl to obtain the target link
				accept: '*/*'	
			}
		};

		request.get(options, function(err, response, body){

			if(!err && response.statusCode == 200){

				var data = getMeta(body);

				exports.printObject(data);
				

				var metaObject = {
					title: data['title'],
					description: data['twitter:description'],
					image_src: data['twitter:image:src'],
					target_url: url
				}

				callback(metaObject);

			}else {
				callback({status_code: response.status_code});
			}
		});

	}
}


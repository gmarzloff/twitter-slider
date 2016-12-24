var getMeta = require("lets-get-meta"),
         fs = require('fs'),
	   path = require('path'),
	request = require('request');

// var filepath = path.dirname(fs.realpathSync(__filename)) + "/testhead.html";

exports.fetchTagsFromURL = function(url, callback){

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

			var data = getMeta.getMeta(body);

			// console.log("getMeta data:\n" + JSON.stringify(data, null, '\t') + "\n");
			
			var metaObject = {
				title: data['title'],
				description: data['twitter:description'],
				image_src: data['twitter:image:src'],
				target_url: url
			}

			// console.log(JSON.stringify(metaObject,null,'\t') + "\n");
			// 	console.log(JSON.stringify(data));

			callback(metaObject);

		}else {
			callback({status_code: response.status_code});
		}
	});

};

// function iterateThroughProperties(obj, callback) {

// 	var newObj;
// 	var itemsProcessed = 0; 	// counter for loop callback

// 	Object.keys(obj).forEach(function(element, key, _array){
		
// 		switch(element) {

// 			case 'twitter:image:src':
// 				newObj.image_src = obj[key];
// 				break;
// 			case 'twitter:title':
// 				newObj.title = obj[key];
// 				break;
// 			case 'twitter:description':
// 				newObj.description = obj[key];
// 				break;
// 			case 'twitter:url':
// 				newObj.url = obj[key];
// 				break;
// 			default:
// 				"skipping irrelevant property: " + element;
// 				break;
// 		}
// 		itemsProcessed++;

// 		if(itemsProcessed === _array.length) {
// 			callback(newObj);
// 		}
// 	});
	
// }
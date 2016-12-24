// Twitter Slider
// Written by George Marzloff 2016 twitter/github: @gmarzloff
// This is the node.js script index.js to run server-side
// ideally running as a cron script

var Twitter = require('twitter'),
         fs = require('fs'),
	     path = require('path'),
     config = require('./config/config'),
       meta = require('./meta_utils');

var client = new Twitter(config.twitter);
var json_filename = 'twitterdump.json';     // Filename for your filtered tweets

// Defines the filtering parameters. See descriptions here: 
// https://dev.twitter.com/rest/reference/get/statuses/user_timeline

var params = {
  screen_name: config.twitter.screen_name,
  count: 15,                                // how many results do you want to receive?
  include_rts: 1,                          // include re-tweets?
  trim_user: true,                         // avoid the entire user object for every tweet
  exclude_replies: true,
  extended_entities: true,
};

var filtered_tweets = [];
var      dir_string = path.dirname(fs.realpathSync(__filename));

client.get('statuses/user_timeline', params, function(error, tweets, response) {
  if (!error) {

  	// Filter the tweets by shared links
    // only take these data: created_at, text, picture,summary,title,url,display_url,
    // scrape the meta-tags for title, description, image-src

    var tasksRemainingCount = tweets.length;

    for(i=0;i<tweets.length;i++){
      
      var t = tweets[i];        // convenience var
      var populated_url = '';   // parsing to get the url, depending on whether the status is new or retweet

      filtered_tweets[i] = {
        created_at: t.created_at,
        status_text: t.text,
        entities: {
          urls: [
            {
              url: t.entities.urls.url,
              display_url: t.entities.urls.display_url,
            }
          ]
        },
      };

      if (("urls" in t.entities) && (t.entities.urls.length > 0) && ("expanded_url" in t.entities.urls[0])) {
        populated_url = t.entities.urls[0].expanded_url;
      
      }else if(("retweeted_status" in t) && ("urls" in t.retweeted_status.entities) && (t.retweeted_status.entities.urls.length>0)) {

        if("expanded_url" in t.retweeted_status.entities.urls[0]) {
          // the url is within the retweet object 
          populated_url = t.retweeted_status.entities.urls[0].expanded_url;
        }
      }

      if(populated_url.length>0){
        
        fetchWrapper(i,populated_url,function(){
            tasksRemainingCount--;
            console.log('tasksRemainingCount: '+ tasksRemainingCount);

            if(tasksRemainingCount==0){
              // all tweets have been processed. save filtered_tweets object to file
              writeTweetsToFile();
            }
        });

      }else{
        console.log("No url could be found for this status.");
        tasksRemainingCount--;

         if(tasksRemainingCount==0){
            // all tweets have been processed. save filtered_tweets object to file
            writeTweetsToFile();
          }
      }
    }
  
  }else{ // end if(!error)
    console.log(err);
  } 

});

function fetchWrapper(index, found_url, callback){
   // this wrapper function is needed because we use a callback within a for loop and need to refer to
   // the iteration index somehow.
  meta.fetchTagsFromURL(found_url, function(data){
    
    filtered_tweets[index].metadata = data;
    console.log("new tweet object for " + found_url + ": \n" + filtered_tweets[index]);
    callback();
    
  });
}

function writeTweetsToFile(){

  var full_path_filename_string = dir_string + "/" + json_filename;
  fs.writeFile(full_path_filename_string, JSON.stringify(filtered_tweets), function(err){
    if(err){
      return console.log("error: " + err);
    }
    console.log("File saved to: " + full_path_filename_string);
  });

}


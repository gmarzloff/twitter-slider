// Twitter Slider
// Written by George Marzloff 2016 twitter/github: @gmarzloff
// This is the node.js script index.js to run server-side
// ideally running as a cron script

var Twitter = require('twitter'),
         fs = require('fs'),
	     path = require('path'),
     config = require('./config/config'),
       meta = require('./meta_utils'),
    crontab = require('node-crontab');

var client = new Twitter(config.twitter);

var json_filename = 'www/tweets.json';     // Filename for your filtered tweets

var params = {
  // defines the filtering parameters. See descriptions here: 
  // https://dev.twitter.com/rest/reference/get/statuses/user_timeline
  screen_name: config.twitter.screen_name,
  count: 15,                                // how many results do you want to receive?
  include_rts: 1,                           // include re-tweets?
  trim_user: true,                          // avoid the entire user object for every tweet
  exclude_replies: true,
  extended_entities: true,
};

var filtered_tweets = [];
var      dir_string = path.dirname(fs.realpathSync(__filename));

var fetch_tweets_cronjob = crontab.scheduleJob("*/30 * * * *", function(){
  // cron syntax: "*/30 * * * *" means every 30 minutes.
  // See here for more info: http://www.adminschoice.com/crontab-quick-reference
  // To make script run once immediately, comment out the var fetch_tweets_cronjob line above 
  // and its closing braces below to unwrap the client.get() function

  client.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {

    	// Filter the tweets by shared links
      // only take these data: created_at, text, picture,summary,title,url,display_url,
      // scrape the meta-tags for title, description, image-src

      var tasksRemainingCount = tweets.length;

      for(i=0;i<tweets.length;i++){
        
        var t = tweets[i];        // convenience var
        var populated_url = '';   // parsing to get the url, depending on whether the status is new or retweet

        // meta.printObject(t);   // Uncomment to output data response retrieved from the Twitter API

        filtered_tweets[i] = {
          created_at: t.created_at,
          status_text: t.text,
          url: (t.entities.urls[0] != undefined && t.entities.urls[0].url != undefined) ? t.entities.urls[0].url  : "",
          display_url: (t.entities.urls[0] != undefined && t.entities.urls[0].display_url != undefined) ? t.entities.urls[0].display_url : ""
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
              console.log('Processing tweet. ' + tasksRemainingCount + ' remaining.');

              if(tasksRemainingCount==0){
                // all tweets have been processed. save filtered_tweets object to file
                // filtered_tweets.sort(dateSortFunction); // Uncomment if you want to sort in ascending time order
                writeTweetsToFile();
              }
          });

        }else{
          console.log("No url could be found for this status.");
          tasksRemainingCount--;

           if(tasksRemainingCount==0){
              // all tweets have been processed. save filtered_tweets object to file
              // filtered_tweets.sort(dateSortFunction); // Uncomment if you want to sort in ascending time order
              writeTweetsToFile();
            }
        }

      } // end of for loop
    
    }else{ // end if(!error)
      console.log(err);
    } 

  });
});

function fetchWrapper(index, found_url, callback){
   // this wrapper function is needed because we use a callback within a for loop and need to refer to
   // the iteration index somehow.
  meta.fetchTagsFromURL(found_url, function(data){
    
    filtered_tweets[index].metadata = data;
    callback();

  });
}

function writeTweetsToFile(){

  var full_path_filename_string = dir_string + "/" + json_filename;
  fs.writeFile(full_path_filename_string, JSON.stringify(filtered_tweets), function(err){
    if(err){
      return console.log("error: " + err);
    }
    console.log("File saved on " + printDateAndTime() + " to: " + full_path_filename_string);
  });

}

function dateSortFunction(a,b){
    // If you need to sort the dates in ascending order. 
    // Tweets will be in descending order by default from twitter.
    var dateA = new Date(a.created_at).getTime();
    var dateB = new Date(b.created_at).getTime();
    return dateA > dateB ? 1 : -1;
}

function printDateAndTime() {
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return month + "/" + day + "/" + year + " @ " + hour + ":" + min + ":" + sec;

}
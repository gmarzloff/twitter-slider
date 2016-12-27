# Twitter Slider
*A plug-in to populate your tweets into a slider for use on a personal website*
***

## Introduction
There are 2 parts to this project. 

1. The first part is a node script `index.js` that uses the twitter API to fetch statuses from a user. For tweets referring to links, the script attempts to follow them to find metadata used to make the "summary cards" (image, title, description, etc). Finally, the script saves the tweets to a file (www/tweets.json by default). The `index.js` script uses [node-crontab](https://github.com/NineCollective/node-crontab) to run and update the tweet file every 30 minutes (user customizable).

2. The second part is the front-end slider in the www folder. It parses the json file generated by node and renders the object data into a [Lean-Slider](https://github.com/gilbitron/Lean-Slider).

## Installation

1. Clone the project
2. Run ``` npm install ```

## Generating JSON data source 
1. The node script is designed to run in the server background and can be run with [forever](https://github.com/foreverjs/forever) to accomplish this. 

```
$ npm install forever -g

$ cd the/path/of/twitter-slider
$ forever start index.js
```
The tweet objects produced in the json have the following structure: 
```javascript
[
  {
    "created_at": "Tue Dec 27 18:17:33 +0000 2016",
    "status_text": "“10 Tips to become a better Swift Developer” by @bobleesj https://t.co/aY3boA5Fv5",
    "url": "https://t.co/aY3boA5Fv5",
    "display_url": "medium.com/ios-geek-commu…",
    "metadata": {
      "title": "10 Tips to become a better Swift Developer – iOS Geek Community",
      "description": "So, you’ve been around with Swift for a couple of months. Now, you want to become a better Swift Developer? DRY, KISS, and not WET? I’ve got golden nuggets here and there for you. Excuse me for the…",
      "image_src": "https://cdn-images-1.medium.com/max/1200/1*Q01FTzw-urEgt0r8_leF4Q.png",
      "target_url": ""
    }
  },
  // etc
]
```
## Front-end Slider


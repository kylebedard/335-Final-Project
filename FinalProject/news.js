let hm = require('hackernews-api');
const http = require('http');
const { argv } = require('process');
const path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const portNumber = 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const { response } = require('express');

let arr = hm.getTopStories();

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:false}));

app.get("/", (request, response) => {
    response.render("index");
});

app.get("/keyword", (request, response) => {
    response.render("keyword");
});

app.post("/keyword", (request, response) => {
    let key = request.body.key;
    let stories = filterByKey(key);
    
})

 function filterByKey(word) {
    let ans = [];
    let counter = 0;

    for (item of arr) {
        let story = hm.getItem(item);

        if(story.title.includes(word)) {
            ans.push(story)
        }
        counter += 1
        if (counter === 100){
            break
        }
    }
    return ans;
 }

 app.listen(portNumber);

 console.log(`Web server started and running at http://localhost:${portNumber}`);

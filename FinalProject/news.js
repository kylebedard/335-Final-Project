let hn = require('hackernews-api');
const http = require('http');
const { argv } = require('process');
const path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const portNumber = 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const { response } = require('express');

let arr = hn.getTopStories();

const userName = "user";
const password = "CMSC335";
const databaseAndCollection = {db: "CMSC335_DB", collection:"HackerNewsData"};
const uri = `mongodb+srv://${userName}:${password}@cluster0.qbkiy4o.mongodb.net/test`;;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function insertData(client, databaseAndCollection, data) {
    const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection)
	.insertOne(data);
}

async function insert(data) {
    try {
        await client.connect();   
        await insertData(client, databaseAndCollection, data);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

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
    let stories = getStoriesBasedOnKey(key);
    
    let table = "<table border=\"1\"><th>Data</th><th>Info</th>";

    table += "<tr><td> keyword </td><td>" + stories.keyword + "</td></tr>";
    table += "<tr><td> instances </td><td>" + stories.instances + "</td></tr>";
    table += "<tr><td> date </td><td>" + stories.date + "</td></tr>";
    table += "<tr><td> titles </td><td>There are "+ stories.titles.length + " stories</td></tr></table>";

    let table2 = "<table border=\"1\"><tr><th>Story Titles</th></tr>"
    for(title of stories.titles) {
        table2 += "<tr><td>" + title + "</td></tr>";
    }
    table2 += "</table>";
    response.render("afterSearch", {table: table, table2: table2});
});

app.get("/clear", (request, response) => {
    response.render("clear");
});

app.post("/clear", (request, response) => {
    let date = remove(request.body.date);

    async function remove() {
        try {
            await client.connect();
            const result = await client.db(databaseAndCollection.db)
                .collection(databaseAndCollection.collection)
                .deleteMany({date: date});
            const variables = {count: result.deletedCount, collection: databaseAndCollection.collection};
            response.render("removed", variables);
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    }
});

app.get("/getDate", (request, response) => {
    response.render("getDate");
});

app.post("/getDatePost", (request, response) => {
    let date = request.body.dateList;
    search();

    async function search() {
        try{
            await client.connect();
                let filter = {date : { $eq: date}};
                const cursor = client.db(databaseAndCollection.db)
                        .collection(databaseAndCollection.collection)
                        .find(filter);
                const result = await cursor.toArray();

                let table = "<table border=\"1\"><tr><th>Keyword</th><th>Count</th></tr>"

                for(story of result) {
                    let keyword = story.keyword;
                    let count = story.titles.length;
                    
                    table += `<tr><td>${keyword}</td><td>${count}</td></tr>`;
                }

                table += "</table>"

                const variables = {dateTable: table, date: date};
                response.render("getDatePost", variables);
        } catch (e) {
            console.error(e);
        } finally {
            await client.close;
        }
        
    }
});

app.use(express.static(__dirname + '/templates'));

function getStoriesBasedOnKey(serach){
    var array = hn.getTopStories();
    var stories = [];
    for(let i = 0; i < 100; i++){
        let currStory = hn.getItem(array[i]);
        if(currStory.title.includes(serach)){
           
            stories.push(currStory.title);

        }
    }
    const data = {
        keyword: serach,
        instances: stories.length,
        titles: stories,
        date: new Date().toLocaleDateString()
    };

   
    insert(data);
    return data;
    
}

function filterByKey(word) {
    let ans = [];
    let counter = 0;

    for (item of arr) {
        let story = hn.getItem(item);

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

'use strict';

//import the express framework
const express = require('express');
const data = require("./Movie Data/data.json");
const server = express();
const PORT = 3000;

//Routes
//home route
server.get('/', (req, res) => {
    if (req.query.error === 'true') {
        res.status(500).send({
            "status": 500,
            "responseText": "Sorry, something went wrong"
        });
    } else {
        let newMovie = new Movie(data.title, data.poster_path, data.overview);
        res.status(200).json(newMovie);
    }
});

// http://localhost:3000/test
server.get('/favorite',(req,res)=>{
    let str = "Welcome to Favorite Page";
    if (req.query.error === 'true') {
        res.status(500).send({
            "status": 500,
            "responseText": "Sorry, something went wrong"
        });
    } else {
        res.status(200).send(str);
    }
});

//default route
server.get('*',(req,res)=>{
    res.status(404).send("page not found error");
})

// http://localhost:3000 => (Ip = localhost) (port = 3000)
server.listen(PORT, () =>{
    console.log(`listening on ${PORT} : I am ready`);
})


function Movie(title, poster_path, overview) {
    this.title = title;
    this.poster_path = poster_path;
    this.overview = overview;
}
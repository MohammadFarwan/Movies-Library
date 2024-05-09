'use strict';

const PORT = 3000;

//import some libraries
const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
require('dotenv').config();
const data = require("./Movie Data/data.json");
const { default: axios } = require('axios');
const apiKey = process.env.API_KEY;
const url = process.env.url;

const { Client } = require('pg')
const client = new Client(url);

const server = express();
server.use(cors());

server.use(bodyParser.urlencoded({ extended: false }))
server.use(bodyParser.json())

//Routes
server.get('/', HandleHomePage );
server.get('/favorite', handleFavorite );   //example: http://localhost:3000/favorite
server.get('/trending', handleTrending );   //example: http://localhost:3000/trending
server.get('/search', handleSearchMovie );  //example: http://localhost:3000/search?name=Spider
server.get('/idsearch', handleSearchById ); //example:http://localhost:3000/idsearch?id=158300
server.get('/latest', handleLatest );       //example:http://localhost:3000/latest

server.post("/addMovie", handleAddMovie);   //http://localhost:3000/addMovie    You have to send json data in body
server.get("/getMovies", handleGetMovies); //http://localhost:3000/getMovies
server.put("/UPDATE/:id", updateMovieHandler); //http://localhost:3000/UPDATE/8     You have to send json data in body
server.delete("/DELETE/:id", deleteMovieHandler); //http://localhost:3000/DELETE/5 
server.get("/getMovie/:id", searchMovieHandler); //http://localhost:3000/getMovie/8    

server.get('*', HandlePageNotFound);
server.use(handleError);

// Functions
function HandleHomePage(req, res) {
    if (req.query.error === 'true') {
        res.status(500).send({
            "status": 500,
            "responseText": "Sorry, something went wrong"
        });
    } else {
        let newMovie = new Movie(data.title, data.poster_path, data.overview);
        res.status(200).json(newMovie);
    }
}
 
function handleFavorite(req,res) {
    let str = "Welcome to Favorite Page";
    if (req.query.error === 'true') {
        res.status(500).send({
            "status": 500,
            "responseText": "Sorry, something went wrong"
        });
    } else {
        res.status(200).send(str);
    }
}

function handleTrending(req, res) {
    let url = `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}`
    axios.get(url)
    .then(result => {
        // console.log(result);
        let movies = result.data.results.map(movie => {
            return new MovieAPI(movie.id, movie.title, movie.release_date, movie.poster_path, movie.overview)
        })
        res.json(movies)
    })
    .catch(error => {
        // handle error
        console.log(error);
        })
}

function handleSearchMovie(req, res) {
    let movieName = req.query.name;
    let url = `https://api.themoviedb.org/3/search/movie?query=${movieName}&api_key=${apiKey}`
    axios.get(url)
    .then(result => {
        // console.log(result);
        let movies = result.data.results.map(movie => {
            return new MovieAPI(movie.id, movie.title, movie.release_date, movie.poster_path, movie.overview)
        })
        res.json(movies)
    })
    .catch(error => {
        // handle error
        console.log(error);
        })
}

function handleSearchById(req, res) {
    let idName = req.query.id;
    //?language=en-US
    let url = `https://api.themoviedb.org/3/person/${idName}?api_key=${apiKey}`;
    axios.get(url)
    .then(result => {
        // console.log(result);
        console.log(result);
        // let movies = result.data.results.map(movie => {
        //     return 
        // })
        res.json(result.data)
        // res.json(result.data)
    })
    .catch(error => {
        // handle error
        console.log(error);
        })
}

function handleLatest(req, res) {
    //?language=en-US
    let url = `https://api.themoviedb.org/3/person/latest?api_key=${apiKey}`;
    axios.get(url)
    .then(result => {
        console.log(result.data);
       
        res.json(result.data)
    })
    .catch(error => {
        // handle error
        console.log(error);
        })
}

function handleAddMovie(req, res) {
    const {title,release_date,poster_path, overview,comment } = req.body;
    let sql = 'INSERT INTO movie(title,release_date,poster_path, overview, comment ) VALUES($1, $2, $3, $4, $5) RETURNING *;' // sql query
    let values = [title,release_date,poster_path,overview,comment];
    client.query(sql, values).then((result) => {
        // console.log(result.rows);
        return res.status(201).json(result.rows[0]);
    })
    .catch((err) => {
        handleError(err, req, res);
    });
    // res.send("success")
}

function handleGetMovies(req, res) {
    let sql = 'SELECT * from movie;'
    client.query(sql).then((result) => {
        // console.log(result);
        res.json(result.rows);
    }).catch((err) => {
        handleError(err, req, res);
    });
}

function HandlePageNotFound(req,res) {
    res.status(404).send("page not found error");
}

function handleError(error) {
    return (error);
}

function updateMovieHandler(req, res) {
    const {title,release_date,poster_path, overview,comment } = req.body;
    const {id} = req.params;
    const sql = `UPDATE movie
    SET title = $1, release_date = $2, poster_path= $3, overview = $4, comment = $5
    WHERE id = ${id}`;
    let values = [title,release_date,poster_path,overview,comment];
    client.query(sql, values).then((result) => {
        // console.log(result.rows);
        res.send(result);
    })
    .catch((err) => {
        handleError(err, req, res);
    });
}

function deleteMovieHandler(req, res) {
    const id = req.params.id;
    console.log(id);
    const sql = `DELETE FROM movie WHERE id=${id}`;
    client.query(sql)
        .then((data) => {
            res.status(202).send(data);
        })
        .catch((err) => {
            handleError(err, req, res);
        });
}

function searchMovieHandler(req,res) {
    const {id} = req.params;
    const sql = `SELECT * FROM movie WHERE id=${id}`;
    client.query(sql)
    .then((result) => {
        // console.log(result);
        res.send(result.rows[0])
    })
    .catch((err) => {
        handleError(err, req, res);
    });
}

client.connect().then(() => {
    server.listen(PORT, () =>{
        console.log(`listening on ${PORT} : I am ready`);
    })
})



// Constructors
function Movie(title, poster_path, overview) {
    this.title = title;
    this.poster_path = poster_path;
    this.overview = overview;
}

function MovieAPI(id, title, release_date, poster_path, overview) {
    this.id = id;
    this.title = title;
    this.release_date = release_date;
    this.poster_path = poster_path;
    this.overview = overview;
}

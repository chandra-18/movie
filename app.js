const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
const convertMovieDbObjectToResponseObject(dbObject)=>{
    return{
        movieId:dbObject.movie_id,
        directorId:dbObject.director_id,
        movieName:dbObject.movie_name,
        leadActor:dbObject.lead_actor,
    };
};
const convertDirectorDbObjectToResponseObject(dbObject)=>{
    return{
        directorId:dbObject.director_id,
        directorName:dbObject.director_name,
    };
};
//Get Movie Names API
app.get('/movies/',async (request,response)=>{
    const getMoviesQuery=`SELECT movie_name FROM movie;`;
    const movieList=await db.all(getMoviesQuery);
    response.send(movieList.map((eachMovie)=>({movieName:eachMovie.movie_name}))
    );
    });

});
//Add Movie API
app.post('/movies/',async (request,response)=>{
    const movieDetails=request.body;
    const {directorId,movieName,leadActor}=movieDetails;
    const addMovieQuery=`INSERT INTO director_id,movie_name,lead_actor
    VALUES('${directorId}','${movieName}','${leadActor}');`;
    await db.run(addMovieQuery);
    response.send("Movie Successfully Added");
});
//Get Movie API
app.get('/movies/:movieId',async (request,response)=>{
    const {movieId}=request.params;
    const movieQuery=`SELECT * FROM movie WHERE movie_id=${movieId};`;
    const movieArray=await db.get(movieQuery);
    response.send(convertMovieDbObjectToResponseObject(movieArray));
});
//Update Movie API
app.put('/movies/:movieId/',async (request,response)=>{
    const {movieId}=request.params;
    const movieDetails=request.body;
    const{directorId,movieName,leadActor}=movieDetails;
    const updateQuery=`UPDATE movie SET director_id=${directorId},movie_name=${movieName},lead_actor=${leadActor} WHERE movie_id=${movieId};`;
    await db.run(updateQuery);
    response.send("Movie Details Updated");
});
//Delete Movie API
app.delete('/movies/:movieId',async (request,response)=>{
    const {movieId}=request.body;
    const deleteMovieQuery=`SELECT * FROM movie WHERE movie_id=${movieId};`;
    await db.run(deleteMovieQuery);
    response.send("Movie Removed");
});
//Get All Directors API
app.get('/directors/',async (request,response)=>{
    const directorsQuery=`SELECT * FROM director;`;
    const directors= await db.all(directorsQuery);
    response.send(directors.map((eachDirector)=>convertDirectorDbObjectToResponseObject(eachDirector))
    );
})
//Get Director API 
app.get('/directors/:directorId/movies',async (request,response)=>{
    const {directorId}=request.params;
    const directorQuery=`SELECT movie_name FROM movie WHERE director_id=${directorId};`;
    const movieDirectorList=await db.get(directorQuery);
    response.send(movieDirectorList.map((eachMovies)=>({movieName:eachMovies.movie_name})
    );
});
module.exports=app;
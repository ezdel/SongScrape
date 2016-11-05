// dependencies
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var request = require('request'); 
var cheerio = require('cheerio');


app.use(bodyParser.urlencoded({
  extended: false
}));

// make public a static dir
app.use(express.static('public'));


// Database configuration with mongoose
//var databaseUri = 'mongodb://localhost/songscrape';

if (process.env.MONGODB_URI) {
	mongoose.connect(process.env.MONGODB_URI);
}
//mongoose.connect('mongodb://heroku_dhd6lzcs:8q77b6jjkeqioubof295eviahc@ds027819.mlab.com:27819/heroku_dhd6lzcs');
else {
mongoose.connect('mongodb://localhost/songscrape');
}

var db = mongoose.connection;

// show any mongoose errors
db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

// once logged in to the db through mongoose, log a success message
db.once('open', function() {
  console.log('Mongoose connection successful.');
});


// And we bring in our Note and Song models
var Note = require('./models/Note.js');
var Song = require('./models/Song.js');


// Routes
// ======

// Simple index route
app.get('/', function(req, res) {
  	res.send(index.html);
});

// A GET request to scrape the billboard website.
app.get('/scrape', function(req, res) {
	// first, we grab the body of the html with request
  request('http://www.billboard.com/charts/hot-100', function(error, response, html) {
  	// then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // now, we grab every h2 within an article tag, and do the following:
    $('div.chart-row__main-display').each(function(i, element) {

    		// save an empty result object
				var result = {};

				// add the text and href of every link, 
				// and save them as properties of the result obj
				result.position = $(this).find('.chart-row__current-week').text().trim();
				result.title = $(this).find('h2').text().trim();
				result.artist = $(this).find('a.chart-row__artist').text().trim();
				result.link = $(this).find('a').attr('href');
				
				// using our Song model, create a new entry.
				// Notice the (result):
				// This effectively passes the result object to the entry (and the title and link)
				var entry = new Song (result);

				// now, save that entry to the db
				entry.save(function(err, doc) {
					// log any errors
				  if (err) {
				    console.log(err);
				  } 
				  // or log the doc
				  else {
				    console.log(doc);
				  }
				});
    });
  });
  // tell the browser that we finished scraping the text.
  res.redirect("/");
});

// this will get the articles we scraped from the mongoDB
app.get('/songs', function(req, res){
	// grab every doc in the Articles array
	Song.find({}, function(err, doc){
		// log any errors
		if (err){
			console.log(err);
		} 
		// or send the doc to the browser as a json object
		else {
			res.json(doc);
		}
	});
});

// grab an article by it's ObjectId
app.get('/songs/:id', function(req, res){
	// using the id passed in the id parameter, 
	// prepare a query that finds the matching one in our db...
	Song.findOne({'_id': req.params.id})
	// and populate all of the notes associated with it.
	.populate('note')
	// now, execute our query
	.exec(function(err, doc){
		// log any errors
		if (err){
			console.log(err);
		} 
		// otherwise, send the doc to the browser as a json object
		else {
			res.json(doc);
		}
	});
});


// replace the existing note of an article with a new one
// or if no note exists for an article, make the posted note it's note.
app.post('/songs/:id', function(req, res){
	// create a new note and pass the req.body to the entry.
	var newNote = new Note(req.body);

	// and save the new note the db
	newNote.save(function(err, doc){
		// log any errors
		if(err){
			console.log(err);
		} 
		// otherwise
		else {
			// using the Song id passed in the id parameter of our url, 
			// prepare a query that finds the matching Song in our db
			// and update it to make it's lone note the one we just saved
			Song.findOneAndUpdate({'_id': req.params.id}, {'note':doc._id})
			// execute the above query
			.exec(function(err, doc){
				// log any errors
				if (err){
					console.log(err);
				} else {
					// or send the document to the browser
					res.send(doc);
				}
			});
		}
	});
});







// listen on port 3000
app.listen(3000, function() {
  console.log('App running on port 3000!');
});
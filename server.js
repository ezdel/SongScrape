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

app.use(express.static('public'));


if (process.env.MONGODB_URI) {
	mongoose.connect(process.env.MONGODB_URI);
}
else {
mongoose.connect('mongodb://localhost/songscrape');
}

var db = mongoose.connection;


db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

db.once('open', function() {
  console.log('Mongoose connection successful.');
});

var Note = require('./models/Note.js');
var Song = require('./models/Song.js');


// Routes
// ======

app.get('/', function(req, res) {
  	res.send(index.html);
});

app.get('/scrape', function(req, res) {
  	request('http://www.billboard.com/charts/hot-100', function(error, response, html) {
    	var $ = cheerio.load(html);
    	$('div.chart-row__main-display').each(function(i, element) {
				var result = {};

				result.position = $(this).find('.chart-row__current-week').text().trim();
				result.title = $(this).find('h2').text().trim();
				result.artist = $(this).find('a.chart-row__artist').text().trim();
				result.link = $(this).find('a').attr('href');
	
				var entry = new Song (result);

				entry.save(function(err, doc) {
				  if (err) {
				    console.log(err);
				  } 
				  else {
				    console.log(doc);
				  }
				});
    	});
  	});
  res.redirect('back');
});

app.get('/songs', function(req, res){
	Song.find({}, function(err, doc){
		if (err){
			console.log(err);
		} 
		else {
			res.json(doc);
		}
	});
});

app.get('/songs/:id', function(req, res){
	Song.findOne({'_id': req.params.id})
	.populate('note')
	.exec(function(err, doc){
		if (err){
			console.log(err);
		} 
		else {
			res.json(doc);
		}
	});
});

app.post('/songs/:id', function(req, res){
	var newNote = new Note(req.body);
	newNote.save(function(err, doc){
		if(err){
			console.log(err);
		} 
		else {
			Song.findOneAndUpdate({'_id': req.params.id}, {'note':doc._id})
			.exec(function(err, doc){
				if (err){
					console.log(err);
				} else {
					res.send(doc);
				}
			});
		}
	});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function(){
 console.log('App listening on PORT ' + PORT);
});
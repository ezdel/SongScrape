var express = require('express');
var router = express.Router();
var song = require('../models/Song.js');
var note - require('../models/Note.js');


router.get('/', function (req, res) {
	res.redirect('/songs');
});

router.get('/songs', function (req, res) {
	songs.selectAll(function (data) {
		var songObject = { songs: data };
		res.render('index', songObject);
	});
});

// router.post('/notes/create', function (req, res) {
// 	spaceship.insertOne('passengers', req.body.passengers, function () {
// 		res.redirect('/spaceships');
// 	});
// });

// router.put('/spaceships/update/:id', function (req, res) {
// 	var condition = 'id = ' + req.params.id;

// 	spaceship.updateOne({ launched: req.body.launched }, condition, function () {
// 		res.redirect('/spaceships');
// 	});
// });

module.exports = router;
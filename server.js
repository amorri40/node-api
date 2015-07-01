// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
var morgan     = require('morgan');

// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port     = process.env.PORT || 3001; // set our port

var mongoose   = require('mongoose');
mongoose.connect('mongodb://62.210.115.189:27017/ukpa_database'); // connect to our database
var Tag     = require('./app/models/tags');
var Comic     = require('./app/models/comics');

// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening.');
	next();
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });	
});

// on routes that end in /Tags
// ----------------------------------------------------
router.route('/tags')

	// create a Tag (accessed at POST http://localhost:8080/Tags)
	.post(function(req, res) {
		res.header('Access-Control-Allow-Origin' , '*' );		
		// var tag = new Tag();		// create a new instance of the Tag model
		// tag.name = req.body.name;  // set the Tags name (comes from the request)

		// tag.save(function(err) {
		// 	if (err)
		// 		res.send(err);

		// 	res.json({ message: 'Tag: '+tag.name+' created!' });
		// });

		var query = {'name':req.body.name};
		// var newData = {}
		// newData.name = req.body.name;
		// Tag.findOneAndUpdate(query, req.newData, {upsert:true}, function(err, doc){
		//     if (err) return res.send(500, { error: err });
		//     res.json({ message: 'Tag: '+tag.name+' created!' });
		// });

	var tag_name = req.body.name;

	Tag.update(query, {$set: { 'name': tag_name },$setOnInsert: {'approved':0}, $inc: {'usage': 1}}, {upsert: true}, function(err){
		if (err) return res.send(500, { error: err });
	    res.json({ message: 'Tag: '+tag_name+' created!' });
	})


		
	})

	// get all the Tags (accessed at GET http://localhost:8080/api/Tags)
	.get(function(req, res) {
		Tag.find(function(err, tags) {
			if (err)
				res.send(err);

			res.jsonp(tags);
		});
	});


// 
// # Comics info
// 
router.route('/comics')
.get(function(req, res) {

		Comic.find(function(err, tags) {
			if (err)
				res.send(err);
			res.json(tags);
		});
	});

router.route('/comic/:comic_name/:page_number/tags')
.get(function(req, res) {
	
	res.header('Access-Control-Allow-Origin' , '*' );
	var comic_name = req.params.comic_name;
	var page_number = req.params.page_number;
	console.log(page_number)

	var query = {'file_name':req.params.comic_name};
	console.log(query,req.params.comic_name)
			Comic.findOne(query, function(err, comic) {
				if (err)
					res.send(err);

				console.log(comic, comic.pages, page_number, typeof(comic.pages), Object.keys(comic.pages))

				var the_page = comic.pages[page_number];
				if (typeof(the_page) !== 'undefined')
					res.json(the_page);
				else
					res.json(comic.pages);
			});
	})
.post(function(req, res) {
	res.header('Access-Control-Allow-Origin' , '*' );
	var comic_name = req.params.comic_name;
	var page_number = req.params.page_number;
	var query = {'file_name':req.params.comic_name};
	console.log(query,req.params, req.body.tags);

	var data_to_set = 'pages['+page_number+']tags';

	var data_to_update = {$set:{}};
	data_to_update['$set'][data_to_set] = req.body.tags;

	Comic.update(query, data_to_update, function(err) {
		if (err) 
			return res.send(500, { error: err });
	    res.json({ message: comic_name+' updated!' });
	});
});



// on routes that end in /Tags/:Tag_id
// ----------------------------------------------------
router.route('/tags/:tag_id')

	// get the Tag with that id
	.get(function(req, res) {
		Tag.findById(req.params.tag_id, function(err, tag) {
			if (err)
				res.send(err);
			res.json(tag);
		});
	})

	// update the Tag with this id
	.put(function(req, res) {
		Tag.findById(req.params.tag_id, function(err, tag) {

			if (err)
				res.send(err);

			tag.name = req.body.name;
			tag.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'Tag updated!' });
			});

		});
	})

	// delete the Tag with this id
	.delete(function(req, res) {
		Tag.remove({
			_id: req.params.tag_id
		}, function(err, tag) {
			if (err)
				res.send(err);

			res.json({ message: 'Successfully deleted' });
		});
	});


// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ComicSchema   = new Schema({
	file_name: String,
	pages: [{tags:Array}]
}, { collection: 'comic_collection' });

module.exports = mongoose.model('Comic', ComicSchema);
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TagSchema   = new Schema({
	name: String,
	approved: Boolean,
	usage: Number,
	spam: Boolean,
});

module.exports = mongoose.model('Tag', TagSchema);
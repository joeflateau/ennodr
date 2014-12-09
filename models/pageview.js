var mongoose = require('mongoose');
module.exports = mongoose.model('Pageview', { 
	name: String,
	count: Number
});
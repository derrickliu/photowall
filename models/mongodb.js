var mongoose = require('mongoose'); //http://mongoosejs.com/
mongoose.connect('mongodb://localhost/photowall');
module.exports = mongoose;
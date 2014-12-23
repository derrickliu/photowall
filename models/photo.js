var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;
var photoSchema = new Schema({
	email: String,
	name: String,
	date: String,
	time: Number
});

var Photo = mongodb.mongoose.model("Photo", photoSchema);
var PhotoDAO = function(){};
module.exports = new PhotoDAO();

PhotoDAO.prototype.save = function(obj, callback) {
	var instance = new Photo(obj);
	instance.save(function(err){
		callback(err);
	});
};

PhotoDAO.prototype.findByEmail = function(email, callback) {
	Photo.find({email: email},function(err,obj){
		callback(err,obj)
	})
};

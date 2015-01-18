var mongodb = require('./mongodb');
var Schema = mongodb.Schema;
var photoSchema = new Schema({
	email: String,
	name: String,
	date: String,
	time: {type: Number, index: true}
});

var Photo = mongodb.model("Photo", photoSchema);
var PhotoDAO = function(){
	this.Photo = Photo;
};


PhotoDAO.prototype.save = function(obj, callback) {
	var instance = new this.Photo(obj);
	instance.save(function(err,doc){
		callback(err,doc);
	});
};

PhotoDAO.prototype.findByEmail = function(email, callback) {
	this.Photo.find({email: email},function(err,doc){
		callback(err,doc)
	})
};
PhotoDAO.prototype.page = function(options) {
	this.Photo.find({email: options.email})
		.sort({time: 'desc'})
		.skip(options.start)
		.limit(options.limit)
		.exec(options.callback);
};
// PhotoDAO.prototype.getMaxId = function(callback) {
// 	this.Photo.find()
// 		.sort({id: 'desc'})
// 		.limit(1)
// 		.exec(callback);
// };
PhotoDAO.prototype.remove = function(id,callback) {
	this.Photo.remove({_id: id},function(err){
		callback(err);
	});
};
module.exports = new PhotoDAO();
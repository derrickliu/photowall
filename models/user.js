var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;
var userSchema = new Schema({
	email: String,
	password: String
});

var User = mongodb.mongoose.model("User", userSchema);
var UserDAO = function(){};
module.exports = new UserDAO();

UserDAO.prototype.save = function(obj, callback) {
	var instance = new User(obj);
	instance.save(function(err){
		callback(err);
	});
};

UserDAO.prototype.findByEmail = function(email, callback) {
	User.findOne({email: email},function(err,obj){
		callback(err,obj)
	})
};
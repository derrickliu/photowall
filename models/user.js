var mongodb = require('./mongodb');
var Schema = mongodb.Schema;
var userSchema = new Schema({
	email: {type: String, index: true},
	password: String
});

var User = mongodb.model("User", userSchema);
var UserDAO = function(){
	this.User = User;
};

UserDAO.prototype.save = function(obj, callback) {
	var instance = new this.User(obj);
	instance.save(function(err){
		callback(err);
	});
};

UserDAO.prototype.findByEmail = function(email, callback) {
	this.User.findOne({email: email},function(err,obj){
		callback(err,obj)
	})
};
module.exports = new UserDAO();
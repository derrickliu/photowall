var express = require('express');
var router = express.Router();
var photoDB = require('../models/photo');
// var minifier = require('node-minifier');


router.post('/', function(req, res) {
	if(!req.session.user){
		res.send({result: -1, msg: 'Please login!!'});
	}

	
	var path = req.files.photo.path,
		name = req.files.photo.name,
		email = req.session.user.email,
		d = new Date(),
		date = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear(),
		time = d.getTime();
	
	photoDB.save({email: email,name: name, date: date, time: time},function(err,obj){
		if(!err){
			res.send({result: 200, msg: 'Upload Success!!', info: {
				name: name,
				date: date
			}});
		}else{
			res.send({result: -1, msg: err});
		}



		// minifier.minifyImage(path, path, function(e, data){
		// 	if(e){
		// 	console.log(e);
		// 	}else{
		// 	console.log(data.msg);
		// 	}
		// });
  	});
});

module.exports = router;

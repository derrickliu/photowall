var express = require('express');
var router = express.Router();
var photoDB = require('../models/photo');
var _ = require('underscore-contrib');

function deal(obj){
	var o = [],
		date,
		name,
		email,
		i = 0,
		j = obj.length;

	for(; i < j; i++){
		date = obj[i].date;
		name = obj[i].name;
		email = obj[i].email;

		var _o = _.findWhere(o,{date: date, email: email});
		if(_o){
			_o.names.push({name: name});
		}else{
			o.push({date: date, email: email, names: [{name: name}]});
		}
	}
	return o;
}


router.get('/', function(req, res, next) {
	if(req.param('start') && req.param('count')){
		next();
	}else{
		photoDB.Photo.find().sort({time: 'desc'}).limit(10).exec(function(err,obj){

			// var _obj = deal(obj);
			res.render('index', { title: 'Photo Wall', photos: obj});
		});
	}
});

router.get('/',function(req, res){
	var start = req.param('start'),
		count = req.param('count');
	photoDB.Photo.find().sort({time: 'desc'}).skip(start).limit(count).exec(function(err,obj){

		// var _obj = deal(obj);
		res.send({info: obj, result: 200, msg: 'get success!!'});
	});
});

module.exports = router;

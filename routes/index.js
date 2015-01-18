var express = require('express');
var router = express.Router();
var photoDB = require('../models/photo');
var _ = require('underscore-contrib');

function deal(obj){
	var o = [],
		name,
		id,
		i = 0,
		j = obj.length;

	for(; i < j; i++){
		name = obj[i].name;
		id = obj[i]._id.toString();
		o.push({name: name, id: id});
	}
	return o;
}


router.get('/', function(req, res, next) {
	if(req.param('start') && req.param('count')){
		next();
	}else{
		photoDB.Photo.find().sort({time: 'desc'}).limit(10).exec(function(err,obj){

			var _obj = deal(obj);
			res.render('index', { title: 'Photo Wall', photos: _obj});
		});
	}
});

router.get('/',function(req, res){
	var start = req.param('start'),
		count = req.param('count');
	photoDB.Photo.find().sort({time: 'desc'}).skip(start).limit(count).exec(function(err,obj){

		var _obj = deal(obj);
		res.send({info: _obj, result: 200, msg: 'get success!!'});
	});
});

module.exports = router;

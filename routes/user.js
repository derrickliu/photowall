var express = require('express');
var router = express.Router();
var photoDB = require('../models/photo');
var _ = require('underscore-contrib');

var gm = require('gm');


function deal(obj){
	var o = [],
		date,
		name,
		_obj = obj.sort(function(a,b){
			return b.time - a.time;
		}),
		i = 0,
		j = _obj.length,
		id;

	for(; i < j; i++){
		date = _obj[i].date;
		name = _obj[i].name;
		id = _obj[i]._id.toString();

		var _o = _.findWhere(o,{date: date});
		if(_o){
			_o.names.push({name: name, id: id});
		}else{
			o.push({date: date, names: [{name: name, id: id}]});
		}
	}
	return o;
}


/* GET user listing. */
router.get('/', function(req, res, next) {
	var user = req.session.user;
	if(!user){
		// res.redirect('/login');
		// return;
		// 为了演示方便，先去掉登录要求
		user = {
			email: '6@qq.com'
		};
		
	}
	if(req.param('start') && req.param('count')){
		next();
	}else{
		photoDB.page({
			start: 0,
			limit: 10,
			email: user.email,
			callback: function(err,obj){
				if(err) throw err;
				var _obj = deal(obj);
				res.render('user', { title: 'user - Photo Wall', photos: _obj, hasLoadCount: obj.length});
			}
		});
	}
});

//分批获取图片
router.get('/',function(req, res){
	var user = {
			email: '6@qq.com'
		},
		start = req.param('start'),
		count = req.param('count');
	photoDB.page({
		start: start,
		limit: count,
		email: user.email,
		callback: function(err,obj){
			if(err) throw err;
			var _obj = deal(obj);
			res.send({
				info: {
					photos: _obj, 
					counts: obj.length
				}, 
				result: 200, 
				msg: 'get success!!'
			});
		}
	});
});

//upload
//
router.post('/', function(req, res) {
	// if(!req.session.user){
	// 	res.send({result: -1, msg: 'Please login!!'});
	// 	return;
	// }
	var user = {
		email: '6@qq.com'
	};


	var path = req.files.photo.path,
		_name = req.files.photo.name,
		name = _name.split('.')[0] + '_200.' + _name.split('.')[1],
		email = user.email,
		d = new Date(),
		date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(),
		time = d.getTime(),

		save = function(){
			photoDB.save({
				email: email,
				name: name, 
				date: date, 
				time: time
			},function(err,obj){
				if(!err){
					sendOk(obj._id.toString());
				}else{
					res.send({result: -1, msg: err});
				}
			});//保存
		},
		resize = function(){
			//压缩图片
			gm(path)
			.size(function(err,value){
				if(err) throw err;
				
				var _path = path.split('.')[0] + '_200.' + path.split('.')[1];
				gm(path)
				.resize(200)
				.write(_path,function(err){
					if(err) throw err;
					save();
				});

				if(value.width > 640){
					gm(path)
					.resize(640)
					.write(path,function(err){
						if(err) throw err;
					});

				}
			});
		},
		sendOk = function(id){
			res.send({
				result: 200, 
				msg: 'Upload Success!!', 
				info: {
					name: name,
					date: date,
					id: id
				}
			});
		};
	// save();	
	resize();
	
});

//delete
//
router.delete('/', function(req, res) {
	// if(!req.session.user){
	// 	res.send({result: -1, msg: 'Please login!!'});
	// 	return;
	// }
	var id = req.param('id');
	if(!id){
		res.send({result: -1, msg: 'no id'});
	}

	photoDB.remove(id, function(err){
		if(err){
			res.send({result: -1, msg: err});
		}else{
			res.send({result: 200, msg: 'remove success!!'});
		}
	});
});

// router.delete('/', function(req, res) {
// 	if(!req.session.user){
// 		res.send({result: -1, msg: 'Please login!!'});
// 		return;
// 	}
// 	var id = req.param('id');
// 	if(!id){
// 		res.send({result: -1, msg: 'no id'});
// 	}

// 	photoDB.remove(id, function(err){
// 		if(err){
// 			res.send({result: -1, msg: err});
// 		}else{
// 			res.send({result: 200, msg: 'remove success!!'});
// 		}
// 	});
// });

module.exports = router;

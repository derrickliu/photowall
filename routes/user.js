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
		j = _obj.length;

	for(; i < j; i++){
		date = _obj[i].date;
		name = _obj[i].name;
		id = _obj[i].id;

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
		res.redirect('/login');
		return;
	}
	if(req.param('start') && req.param('count')){
		next();
	}else{
		photoDB.page({
			start: 0,
			limit: 10,
			email: user.email,
			callback: function(err,obj){
				var _obj = deal(obj);
				res.render('user', { title: 'user - Photo Wall', photos: _obj, hasLoadCount: obj.length});
			}
		});
	}
});

//分批获取图片
router.get('/',function(req, res){
	var start = req.param('start'),
		count = req.param('count');
	photoDB.page({
		start: start,
		limit: count,
		email: res.locals.user.email,
		callback: function(err,obj){
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
	if(!req.session.user){
		res.send({result: -1, msg: 'Please login!!'});
		return;
	}
	
	var path = req.files.photo.path,
		name = req.files.photo.name,
		email = req.session.user.email,
		d = new Date(),
		date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(),
		time = d.getTime(),

		save = function(id){
			photoDB.save({
				email: email,
				name: name, 
				date: date, 
				time: time, 
				id: id
			},function(err,obj){
				if(!err){
					resize(id);
				}else{
					res.send({result: -1, msg: err});
				}
			});//保存
		},
		resize = function(id){
			//压缩图片
			gm(path)
			.size(function(err,value){
				if(value.width > 640){
					gm(path)
					.resize(640)
					.write(path,function(err){
						if(err){
							console.log(err);
							return;
						}
						sendOk(id);
						
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
		},
		getMaxId = function(){
			photoDB.getMaxId(function(err,obj){
				if(err){
					console.log(err);
					return;
				}
				var id = obj[0] ? (obj[0].id + 1) : 1;
				save(id);
			});
		}

		getMaxId();

	// photoDB.getMaxId(function(err,obj){
	// 	if(err){
	// 		console.log(err);
	// 		return;
	// 	}
	// 	var id = obj[0] ? (obj[0].id + 1) : 1;

	// 	// gm(path)
	// 	// .identify(function(){
	// 	// 	debugger;
	// 	// });
			
	// 	//压缩图片
	// 	gm(path)
	// 	.size(function(err,value){
	// 		if(value.width > 640){
	// 			gm(path)
	// 			.resize(640)
	// 			.write(path,function(err){
	// 				if(err) throw err;
	// 				//压缩成功后保存
	// 				photoDB.save({
	// 						email: email,
	// 						name: name, 
	// 						date: date, 
	// 						time: time, 
	// 						id: id
	// 					},function(err,obj){
	// 					if(!err){
	// 						//压缩成功后才通知客户端
	// 						res.send({
	// 							result: 200, 
	// 							msg: 'Upload Success!!', 
	// 							info: {
	// 								name: name,
	// 								date: date,
	// 								id: id
	// 							}
	// 						});
	// 					}else{
	// 						res.send({result: -1, msg: err});
	// 					}
	// 				});//保存

	// 			});//write
	// 		}
	// 	});//size

	// });//getMaxId
	
});

//delete
//
router.delete('/', function(req, res) {
	if(!req.session.user){
		res.send({result: -1, msg: 'Please login!!'});
		return;
	}
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

module.exports = router;

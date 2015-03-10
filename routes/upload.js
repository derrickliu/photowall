var express = require('express');
var router = express.Router();
var photoDB = require('../models/photo');
var fs = require("fs");
var gm = require('gm');
var crypto = require('crypto');
// var minifier = require('node-minifier');


router.post('/', function(req, res) {
	if(!req.session.user){
		res.send({result: -1, msg: 'Please login!!'});
		return;
	}
	var base64Data = req.param('photo');
	var dataBuffer = new Buffer(base64Data, 'base64');
	var email = req.session.user.email,
		d = new Date(),
		date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(),
		time = d.getTime(),
		save = function(){
			photoDB.save({
				email: email,
				name: name_200, 
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
				
				gm(path)

				.resize(200)
				
				.write(path_200,function(err){
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
					name: name_200,
					date: date,
					id: id
				}
			});
		},
		rename = function(){
		    var random_string = 'xxxx.png' + Date.now() + Math.random();
		    return crypto.createHash('md5').update(random_string).digest('hex');
		},
		name = rename(),
		name_200 = name + '_200.png',
		path = 'uploads/' + name + '.png',
		path_200 = 'uploads/' + name_200;
	
    fs.writeFile(path, dataBuffer, function(err) {
        if(err){
    		res.send({result: -1, msg: err});
        }else{
      		resize();
        }
    });
	// var path = req.files.photo.path,
	// 	name = req.files.photo.name,
	// 	email = req.session.user.email,
	// 	d = new Date(),
	// 	date = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear(),
	// 	time = d.getTime();
	
	// photoDB.save({email: email,name: name, date: date, time: time},function(err,obj){
	// 	if(!err){
	// 		res.send({result: 200, msg: 'Upload Success!!', info: {
	// 			name: name,
	// 			date: date
	// 		}});
	// 	}else{
	// 		res.send({result: -1, msg: err});
	// 	}



	// 	// minifier.minifyImage(path, path, function(e, data){
	// 	// 	if(e){
	// 	// 	console.log(e);
	// 	// 	}else{
	// 	// 	console.log(data.msg);
	// 	// 	}
	// 	// });
 //  	});
});

module.exports = router;

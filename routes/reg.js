var express = require('express');
var router = express.Router();
var userDB = require('../models/user');

router.get('/', function(req, res) {
	if(req.session.user){
		res.redirect('/');
	}else{
		res.render('reg', { title: 'Register - Photo Wall' });
	}
});

router.post('/', function(req, res) {
	if(req.session.user){
		res.redirect('/');
		return;
	}
	var email = req.param('email'),
		password = req.param('password'),
		passwordConfirm = req.param('passwordConfirm');

	if(password !== passwordConfirm){
		res.send({result: -1, msg: 'Please enter the same password as above'});
		return;
	}
	userDB.findByEmail(email,function(err,obj){
		if(obj !== null){
			res.send({result: -1, msg: email + '---registered'});
		}else{
			userDB.save({email: email,password: password},function(err,obj){
				req.session.user = {
					email: email
				};
				res.send({result: 200, msg: 'Register Success!!'});
		  	});
		}
	});
	
});

module.exports = router;

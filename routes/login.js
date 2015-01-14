var express = require('express');
var router = express.Router();
var userDB = require('../models/user');

/* GET login listing. */
router.get('/', function(req, res) {
	if(req.session.user){
		res.redirect('/user');
	}else{
		res.render('login', { title: 'Sign in - Photo Wall' });
	}
});

router.post('/',function(req, res){
	if(req.session.user){
		res.send({result: -1, msg: 'is login'});
		return;
	}
	var email = req.param('email'),
		password = req.param('password');
	userDB.findByEmail(email,function(err,obj){
		if(obj !== null){
			if(obj.password !== password){
				res.send({result: -1, msg: 'Account number or password is incorrect'});
			}else{
				req.session.user = {
					email: email
				};
				res.send({result: 200, msg: 'Login success!!'});
			}
		}else{
			res.send({result: -1, msg: 'Account number or password is incorrect'});
		}
	});
});

module.exports = router;

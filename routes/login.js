
var express = require('express');
var router = express.Router();
var config = require('config-lite');
var sha1 = require('sha1');

var generateVerifyImg = require('../middleware/authController').generateVerifyImg;
var checkNotLogin = require('../middleware/authController').checkNotLogin;
var userModel = require('../models/user');

//获取登录界面
//get /
router.get('/',checkNotLogin,function(req, res, next){
	res.render('login',{bookNum:0});
});

router.get('/verifycode',function(req, res, next){

	var verify = generateVerifyImg();
	// 将验证码保存到session中，以便验证
	req.session.verifycode = verify.code;
	res.writeHead(200, { 'Content-Type': 'image/png', 'Content-Length': verify.img.length });
    res.end(verify.img);
});

//登录
// post
router.post('/', checkNotLogin, function(req, res, next){
	// 获取数据
	var username = req.body.username;
	var password = req.body.password;
	var verifycode = req.body.verifycode;

	// 数据验证
	if(username.length < 1){
		req.flash('error','用户名不能为空');
		return res.redirect('/login');
	}
	if(password.length < 1){
		req.flash('error','密码不能为空');
		return res.redirect('/login');
	}
	if(verifycode.length < 1){
		req.flash('error','请输入验证码');
		return res.redirect('/login');
	}
	userModel.getUserByName(username,function(err,rows,fields){
		// console.log('err',err);
		// console.log('rows',rows);
		// console.log('fields',fields);
		if(rows.length < 1){
			req.flash('error','用户不存在');
			return res.redirect('/login');
		}
		if(rows[0].password != sha1(password)){
			req.flash('error','用户名或者密码错误');
			return res.redirect('/login');
		}
		if(verifycode !== req.session.verifycode){
			req.flash('error','验证码错误');
			return res.redirect('/login');
		}

		// 设置session
		var username_sig = sha1(config.session.secret_string+username);
		var user = {
			uid:rows[0].uid,
			username:username,
			username_sig:username_sig
		};

		req.session.user = user;
		// 重定向
		res.redirect('/bookindex');
	});
});

module.exports = router;

var express = require('express');
var router = express.Router();
var config = require('config-lite');

var cartModel = require('../models/cart');

var checkLogin = require('../middleware/authController').checkLogin;


//获取注册界面
//get /
router.get('/',checkLogin, function(req, res, next){
	if(!req.session.user){
		return res.render('orderlist',{bookNum:0});
	}
	uid = req.session.user.uid;
	var username = req.session.user.username;
	cartModel.getBookNumInCart(uid,function(err, num, fields){
		res.render('orderlist',{username:username,bookNum:num});
	});
});


module.exports = router;
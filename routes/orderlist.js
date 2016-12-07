
var express = require('express');
var router = express.Router();
var config = require('config-lite');
var moment = require('moment');

var cartModel = require('../models/cart');
var orderModel = require('../models/order');


var checkLogin = require('../middleware/authController').checkLogin;
var createOrders = require('../middleware/orderHelper').createOrders;

//获取注册界面
//get /
router.get('/',checkLogin, function(req, res, next){
	if(!req.session.user){
		return res.render('orderlist',{bookNum:0});
	}
	uid = req.session.user.uid;
	var username = req.session.user.username;

	cartModel.getBookNumInCart(uid,function(err, num, fields){
		// 获取订单数据
		orderModel.getAllOrders(uid,function(err, orders){

			orders = createOrders(orders);
			console.log(orders);
			res.render('orderlist',{username:username,bookNum:num,orders:orders});
			// return;
		});		
	});
});

//
module.exports = router;
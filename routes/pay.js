
var express = require('express');
var router = express.Router();
var cartModel = require('../models/cart');
var orderModel = require('../models/order');
var orderlist = require('./orderlist');

var createOrders = require('../middleware/orderHelper').createOrders;
var checkLogin = require('../middleware/authController').checkLogin;

//获取登录界面
//get /
router.get('/:oid',checkLogin,function(req, res, next){
	var uid = req.session.user.uid;
	cartModel.getBookNumInCart(uid,function(err, num, fields){
		// 获取提交的订单oid
		var oid = req.params.oid;
		console.log("uid",uid);
		console.log("oid",oid);
		// 通过oid获取订单数据
		orderModel.getOneOrder(oid, uid, function(err, rows){
			var orders = createOrders(rows);
			res.render('pay',{bookNum:num,orders:orders});
		});
	});
});

module.exports = router;
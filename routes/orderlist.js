
var express = require('express');
var router = express.Router();
var config = require('config-lite');
var moment = require('moment');

var cartModel = require('../models/cart');
var orderModel = require('../models/order');


var checkLogin = require('../middleware/authController').checkLogin;
var createOrders = require('../middleware/orderHelper').createOrders;

//get /
router.get('/',checkLogin, function(req, res, next){

	uid = req.session.user.uid;
	var username = req.session.user.username;
	// 释放该用户所有未释放未付款的过期订单
	orderModel.releaseAllDisableOrderOfOneUser(uid,function(err,fields){
		// console.log("释放","释放结束");
	});
	cartModel.getBookNumInCart(uid,function(err, num, fields){
		// 获取订单数据
		orderModel.getAllOrders(uid,function(err, orders){

			orders = createOrders(orders);
			// console.log(orders);
			res.render('orderlist',{username:username,bookNum:num,orders:orders});
			// return;
		});		
	});
});

// 取消订单
router.get("/:oid/cancle",checkLogin, function(req, res, next){
	// var uid = req.session.user.uid;
	var oid = req.params.oid * 1.0;
	// console.log("oid",oid);
	// 删除订单 -- 设置released = 1
	orderModel.releaseOrderOfByOid(oid,function(err){
		if(err === "NOTEXIST"){
			// 订单已释放或者不存在
			req.flash("error","订单已过期或者不存在");
		}
		// 处理完毕
		return res.redirect("/orderlist");
	});
});

//
module.exports = router;
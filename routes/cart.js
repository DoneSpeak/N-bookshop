
var express = require('express');
var router = express.Router();

var cartModel = require('../models/cart');
var checkAuth = require('../middleware/authController').checkAuth;
var checkLogin = require('../middleware/authController').checkLogin;
//获取登录界面
//get /
router.get('/',function(req, res, next){
	// 判断是否已经登录
	if(!req.session.user){
		// 未登录
		return res.render('cart',{books:[],bookNum:0});
	}
	if(!checkAuth(req)){
		// 判断是否有权限，防止黑客通过cookie攻击
		req.flash('error','权限不足');
		// 如果黑客已经登录了自己的账号，那么就会在路由login中被重定向到bookindex页
		return res.redirect('/login');
	}
	var uid = req.session.user.uid;
	// 从数据库中抓取购物车信息
	cartModel.getBooksInCart(uid,function(err, rows, fields){
		var books = rows;
		cartModel.getBookNumInCart(uid,function(err, bookNum, fields){
			// 从购物车中获取图书总数
			res.render('cart',{books:books,bookNum:bookNum});
		});
	});
});

// 减少一本书
router.post("/:ISBN/change",function(req,res,next){
	if(!req.session.user){
		req.flash('error','尚未登录');
		// 如果黑客已经登录了自己的账号，那么就会在路由login中被重定向到bookindex页
		return res.json({
			err:"NOTLOGIN"
		});
	}

	if(!checkAuth(req)){
		// 判断是否有权限，防止黑客通过cookie攻击
		req.flash('error','权限不足');
		// 如果黑客已经登录了自己的账号，那么就会在路由login中被重定向到bookindex页
		return res.json({
			err:"NOAUTH"
		});
	}
	// 获取相应的数据
	var uid = req.session.user.uid;
	var isbn = req.body.isbn;
	var bookNum = req.body.bookNum;
	console.log('boookNum',bookNum);
	console.log('uid',uid);
	console.log('isbn',isbn);
	// 将书本数设置为 bookNum
	cartModel.changeOneBookNum(uid,isbn,bookNum,function(err,fields,num){
		console.log("changeOneBookNum",num);
		return res.json({
			err:"OK",
			bookNum:num
		});
	});
});

// 删除一本书
router.post("/:ISBN/del",function(req, res, next){
	if(!req.session.user){
		req.flash('error','尚未登录');
		// 如果黑客已经登录了自己的账号，那么就会在路由login中被重定向到bookindex页
		return res.json({
			err:"NOTLOGIN"
		});
	}

	if(!checkAuth(req)){
		// 判断是否有权限，防止黑客通过cookie攻击
		req.flash('error','权限不足');
		// 如果黑客已经登录了自己的账号，那么就会在路由login中被重定向到bookindex页
		return res.json({
			err:"NOAUTH"
		});
	}
	// 获取相应的数据
	var uid = req.session.user.uid;
	var isbn = req.body.isbn;
	console.log('uid',uid);
	console.log('isbn',isbn);
	cartModel.delOneTypeBook(uid,isbn,function(err,fields){
		return res.json({
			err:"OK"
		});
	});
});

module.exports = router;
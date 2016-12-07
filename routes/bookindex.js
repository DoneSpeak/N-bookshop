
var express = require('express');
var moment = require('moment');

var router = express.Router();
var bookModel = require('../models/book');
var cartModel = require('../models/cart');
var checkLogin = require('../middleware/authController').checkLogin;

//get /
router.get('/',function(req, res, next){
	bookModel.getNormalBooks(function(err, rows, fields){
		// console.log(rows);
		var books = rows;
		if(!req.session.user){
			return res.render('bookindex',{books:books,bookNum:0});	
		}
		uid = req.session.user.uid;
		cartModel.getBookNumInCart(uid,function(err, bookNum, fields){
			res.render('bookindex',{books:books,bookNum:bookNum});
		});
	});
	
});

router.post('/add2cart',function(req, res, next){
	if(!req.session.user){
		// 如果没有登录，则跳转到登录页面

		return res.json({
			err:'NOTLOGIN'
		});
	}
	var isbn = req.body.isbn;
	var uid = req.session.user.uid;
	// 考虑是否已经登录，没有登录购物的信息存在浏览器本地，登录后则存入数据库
	// 暂时都保存到数据库
	cartModel.addBookToCart(uid,isbn,function(err, fields){
		// res.render('bookindex',{books:rows});
		return res.json({
			err:err
		});
	});
	
});

module.exports = router;
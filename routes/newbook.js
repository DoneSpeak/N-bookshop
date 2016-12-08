
var express = require('express');
var router = express.Router();
var bookModel = require('../models/book');
var cartModel = require('../models/cart');
var moment = require('moment');

//获取登录界面
//get /
router.get('/',function(req, res, next){
	// 从数据库中获取书本信息
	var type = 's';
	var today = new Date();
	var week = today.getDay();
	if(week == 2){
		type = 's';
	}else if(week == 4){
		type = 'k';
	}
	var slq = bookModel.getSnapupOrSecillBooks(type,function(err, rows, fields){
		// res.send(rows);
		// 时间格式处理
		var book = rows[0];
		book.publish_time = moment(book.publish_time.toString()).format('YYYY年MM月');

		// 判断是否已经登录
		if(!req.session.user){
			return res.render('newbook',{book:book,snap_kill:type,bookNum:0});
		}
		var uid = req.session.user.uid;
		cartModel.getBookNumInCart(uid,function(err, num, fields){
			if(week != 2 && week != 4){
				week = 'n';
			}
			res.render('newbook',{book:book,snap_kill:type,bookNum:num});
		});
	});

	console.log("sql",slq);
	
});

module.exports = router;
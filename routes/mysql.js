
var express = require('express');
var router = express.Router();
var config = require('config-lite');

//获取登录界面
//get /
router.get('/',function(req, res, next){
	res.render('mysql');
});


module.exports = router;
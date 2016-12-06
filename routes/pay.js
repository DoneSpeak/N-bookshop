
var express = require('express');
var router = express.Router();

//获取登录界面
//get /
router.get('/',function(req, res, next){
	res.render('pay');
});

module.exports = router;
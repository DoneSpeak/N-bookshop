var express = require('express');
var router = express.Router();
var checkLogin = require('../middleware/authController').checkLogin;

router.get('/',checkLogin,function(req, res, next){
	// 删除session
	req.session.user = null;
	// 重定向
	res.redirect('/bookindex');
});

module.exports = router;

var express = require('express');
var router = express.Router();
var config = require('config-lite');
var sha1 = require('sha1');
var userModel = require('../models/user');

var checkNotLogin = require('../middleware/authController').checkNotLogin;


//获取注册界面
//get /
router.get('/',checkNotLogin, function(req, res, next){
	res.render('signin');
});

// 注册
// post
router.post('/', checkNotLogin, function(req, res, next){
	// 获取数据
	var username = req.body.username;
	var password = req.body.password;
	var repassword = req.body.repassword;
	// res.send(username);
	// 检验数据的合法性
	try{
		if(username.length < 1 || username.length > 10){
			throw new Error('用户名长度在 1-10 个字符');
		}

		if(password.length < 6 || password.length > 16){
			throw new Error('密码长度在 6-16 个字符');
		}

		if(password !== repassword){
			throw new Error('两次输入密码不一致');
		}

		// 密码加密
		password = sha1(password);

		var user = {
			name:username,
			password:password
		}
		// 插入到数据库
		userModel.add(user,function(err, fields){
			try{
				if(!err){
					console.log('注册完成');

// 比如我们现在面临着一个菜鸟开发的网站，他用 cookie 来记录登陆的用户凭证。
// 相应的 cookie 长这样：dotcom_user=alsotang，它说明现在的用户是 alsotang 这个用户。
// 如果我在浏览器中装个插件，把它改成 dotcom_user=ricardo，
// 服务器一读取，就会误认为我是 ricardo。然后我就可以进行 ricardo 才能进行的操作了。
					// 设置session,insertId
					var username_sig = sha1(config.session.secret_string+username);
					var user = {
						username:username,
						username_sig:username_sig
					};
					req.session.user = user;
					// 重定向
					res.redirect('/bookindex');

				}else if(err.code === 'ER_DUP_ENTRY'){
					throw new Error("用户名已存在");
				}else{
					throw new Error("注册失败！请稍后再试");
				} 
			}catch(e){
				req.flash('error',e.message);
				res.redirect('/signin');
			}
			
		});

	}catch(e){
		req.flash('error',e.message);
		res.redirect('/signin');
	}
});

module.exports = router;
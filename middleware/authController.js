var ccap = require('ccap');//Instantiated ccap class 
var sha1 = require('sha1');
var config = require('config-lite');

module.exports = {
	checkLogin:function (req, res, next){
		if(!req.session.user){
			req.flash('err','尚未登录');
			return res.redirect('/login');
		}
		var username = req.session.user.username;
		var username_sig = sha1(config.session.secret_string+username);
		if(username_sig != req.session.user.username_sig){
			// 防止黑客通过cookie攻击
			req.flash('error','权限不足');
			return res.redirect('/login');
		}
		
		next();
	},

	checkNotLogin:function (req, res, next){
		if(req.session.user){
			var username = req.session.user.username;
			var username_sig = sha1(config.session.secret_string+username);
			if(username_sig != req.session.user.username_sig){
				// 防止黑客通过cookie攻击
				req.flash('error','权限不足');
				return res.redirect('/login');
			}
			req.flash('error','已登录');
			return res.redirect('back');
		}
		next();
	},

	checkAuth:function(req){
		var username = req.session.user.username;
		var username_sig = req.session.user.username_sig;
		var sig = sha1(config.session.secret_string+username);
		if(username_sig != sig){
			// 防止黑客通过cookie攻击
			return false;
		}
		return true;
	},

	// 获取验证码
	generateVerifyImg:function generateVerifyImg(){

// 使用ccap 就无法是用supervisor，否则无法正常运行
		var captcha = ccap({
			width:150,//set width,default is 256
			height:60,//set height,default is 60
			offset:34,//set text spacing,default is 40
			quality:100,//set pic quality,default is 50
			generate:function(){
		        var items = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPRSTUVWXYZ23456789'.split('');
		        var vcode='';
		        for (var i = 0; i < 4; i++) {
		            var rnd = Math.random();
		            var item = items[Math.round(rnd * (items.length - 1))];
		            vcode+=item;
		        }
		        return vcode;
		    }
		});
		var ary = captcha.get();
		var verify = {
			code:'',
			img:''
		};
		verify.code = ary[0].toLowerCase();
		verify.img = ary[1];

		console.log('verify.code',verify.code);

		return verify;
	}
}
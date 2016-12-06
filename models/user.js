var mysql = require('mysql');
var config = require('config-lite');
var sqlMap = require('./sqlMap');
 
// 使用连接池，提升性能
var connection  = mysql.createConnection({
		host: 'localhost', 
		user: 'carfield',
		password: 'cat123',
		database:'db_bookshop'
	});
 
// 向前台返回JSON方法的简单封装
var jsonWrite = function (res, ret) {
	if(typeof ret === 'undefined') {
		res.json({
			code:'1',
			msg: '操作失败'
		});
	} else {
		res.json(ret);
	}
};
 
module.exports = {
	add: function (user, callback) {

		connection.connect(function(err){
			console.log("连接成功");
		});

		connection.on('error',function(err){
			console.log('出错啦');
		});

		connection.on('close',function(err){
			console.log('关闭');
		});

		// console.log([user.name, user.password]);
		connection.query(sqlMap.usersql.insert, [user.name, user.password], function(err, fields) {
			console.log('insert-err',err);
			console.log('insert-fields',fields);

			if( typeof callback == 'function'){
				callback(err, fields);
			}			
		});
	},
	getUserByName:function(name, callback){
		connection.query(sqlMap.usersql.selectByName, [name], function(err, rows, fields) {
			
			if( typeof callback == 'function'){
				callback(err, rows, fields);
			}
		});
	}
};
var mysql = require('mysql');
var config = require('config-lite');
var sqlMap = require('./sqlMap');
 
// 提升性能
var connection  = mysql.createConnection(config.mysql);

module.exports = {
	getBookNumInCart:function(uid, callback){
		connection.query(sqlMap.cartsql.countBookNum,[uid], function(err, rows, fields){
			var bookNum = rows[0].bookNum;
			if(!bookNum){
				bookNum = 0;
			}
			if(typeof callback === 'function'){
				callback(err, bookNum, fields);
			}
		});
	},
	getBooksInCart:function(uid,callback){
		connection.query(sqlMap.cartsql.selectAll,[uid], function(err, rows, fields){
			if(typeof callback === 'function'){
				callback(err, rows, fields);
			}
		});
	},
	
	addBookToCart: function(uid, isbn, callback){
		// 用于bookindex页面添加书本，库存无书是无法添加，因此无需检验库存是否有书
		// 获取当前购物车中该本书的书本数
		// 获取库存中的该本书
		connection.query(sqlMap.bookstore.getBookStoreNum,[isbn],function(err, rows, fields) {
			var bookStoreNum = rows[0].num;
			console.log("bookStoreNum",bookStoreNum);
			if(bookStoreNum < 1){
				// 已没有库存
				if(typeof callback === 'function'){
					callback("NOTENOUGH", fields);
				}
				return;
			}
			connection.query(sqlMap.cartsql.getOneTypeBookNum,[uid,isbn],function(err, rows, fields) {
				console.log("getOneTypeBookNum-err",err);
				console.log("getOneTypeBookNum-rows",rows);
				console.log("getOneTypeBookNum-fields",fields);
				if(rows.length < 1){
					// 购物车中还没有该书，添加一本
					connection.query(sqlMap.cartsql.addOneBook,[uid,isbn], function(err, fields){
						console.log('addOneBook-fields',fields);
						if(typeof callback === 'function'){
							callback("OK", fields);
						}
					});
				}else{
					var bookCartNum = rows[0].num;
					console.log("bookCartNum",bookCartNum);
					if(bookStoreNum - bookCartNum > 0){
						// 库存的书比购物车的书多上一本以上
						// 购物车上该书增加一本
						connection.query(sqlMap.cartsql.bookNumInc,[uid,isbn],function(err, fields) {
							console.log('bookNumInc-fields',fields);
							if(typeof callback === 'function'){
								callback("OK", fields);
							}
							// connection.query(sqlMap.cartsql.countBookNum,[uid], function(err, rows, fields){
							// 	var bookNum = rows[0].bookNum;
							// 	if(!bookNum){
							// 		bookNum = 0;
							// 	}
							// 	if(typeof callback === 'function'){
							// 		callback(err, bookNum, fields);
							// 	}
							// });
						});
					}else{
						// 库存不足
						if(typeof callback === 'function'){
							callback("NOTENOUGH", fields);
						}
					}
				}
			});
		});
	},
	incOneBook:function(uid, isbn, callback){
		// 用于购物车页面的加号按钮
		connection.query(sqlMap.bookstore.getBookStoreNum,[isbn],function(err, rows, fields){
			
			var num = rows[0].num;
			console.log("bookStore",rows);
			// 判断库存是否有书
			if(num > 0){
				// 还有库存
				// 相应图书增加 1
				connection.query(sqlMap.cartsql.bookNumInc,[uid,isbn], function(err, fields){
					if(typeof callback === 'function'){
						var has = true;
						callback(err, rows, fields, has);
					}
				});
			}else{
				// 没有库存了
				if(typeof callback === 'function'){
					var has = false;
					callback(err, rows, fields, has);
				}
			}
		});
	},
	subOneBook:function(uid, isbn, callback){
		connection.query(sqlMap.cartsql.subOneBook,[uid,isbn],function(err, rows, fields){
			// 获取相应图书数
			connection.query(sqlMap.cartsql.getOneTypeBookNum,[uid,isbn],function(err, rows, fields){
				var num = rows[0].num;
				if(num < 1){
					// 删除该书
					connection.query(sqlMap.cartsql.deleteOneTypeBook,[uid,isbn],function(err, fields){
						if(typeof callback === 'function'){
							callback(err, fields, num);
						}
					});
				}else{
					if(typeof callback === 'function'){
						callback(err, fields, num);
					}
				}
			});
		});
	},
	changeOneBookNum:function(uid,isbn,bookNum,callback){
		if(bookNum < 1){
			console.log("changeOneBookNum",bookNum);
			// 删除该图书
			// 移除该书 -- 设置 incart = 0，以保留用户数据
			connection.query(sqlMap.cartsql.deleteOneTypeBook,[uid,isbn],function(err, fields){
				if(typeof callback === 'function'){
					callback(err, fields, 0);
				}
			});
			return;
		}
		// 考虑库存
		connection.query(sqlMap.bookstore.getBookStoreNum,[isbn],function(err, rows, fields){
			var num = rows[0].num;
			if(bookNum > num){
				// 比库存还要多
				bookNum = num;
				if(num < 0){
					bookNum = 0;
				}				
			}
			console.log('bookNum',bookNum);
			connection.query(sqlMap.cartsql.bookNumReset,[bookNum,uid,isbn],function(err, fields){
				console.log('err',err);
				console.log('bookNumReset-fields',fields);
				if(typeof callback === 'function'){
					callback(err, fields, bookNum);
				}
			});
		});
	},
	delOneTypeBook:function(uid,isbn,callback){
		connection.query(sqlMap.cartsql.deleteOneTypeBook,[uid,isbn],function(err, fields){
			console.log("delOneTypeBook-fields",fields);
			if(typeof callback === 'function'){
				callback(err, fields);
			}
		});
	}
};
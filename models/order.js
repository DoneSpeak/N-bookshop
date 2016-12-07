var mysql = require('mysql');
var config = require('config-lite');
var sqlMap = require('./sqlMap');
var mysqlModel = require('../models/mysql-helper');
 
// 提升性能
var connection  = mysql.createConnection(config.mysql);

function createInsertOrderItemsSql(oid,uid, books){
	var sql = "insert into tb_order_user_book (oid,uid,isbn,num) values ";
	var values = "";
	books.forEach(function(book){
		values += "(" + oid + "," + uid + "," + book.isbn + "," + book.num + "),";
	});
	values = values.substring(0,values.length-1);
	sql += values;
	return sql;
}


module.exports = {
	cteateOrder:function(uid, books, callback){
		// 设置事务起点
		connection.query(sqlMap.common.saveStartPoint,function(err, fields) {
			// console.log("begin-err",err);
			// console.log("begin-fields",fields);
			var have = true;
			for(var i = 0; i < books.length && have; i ++){
				// 预下单，从库存中减少相应书本数
				console.log("books",books[i].isbn);
				connection.query(sqlMap.ordersql.preOrder,[books[i].num,books[i].num,books[i].isbn],function(err, fields) {
					// console.log("preOrder-err",err);
					// console.log("preOrder-fields",fields);
					if(fields.affectedRows < 1){
						// 库存没有了
						have = false;
					}
				});
			}

			if(!have){
				// 库存没有,回滚所有更新操作
				mysqlModel.rollBackToStartPoint();
				if(typeof callback === 'function'){
					return callback('NOTENOUGH',null);
				}
			}else{
				mysqlModel.commit();
			}

			// 下单成功
			var pay_state = 0;
			// 利用添加时间的时间戳作为oid
			var oid = Date.now();
			console.log("oid",oid);
			// 3小时下单
			var disable_time = oid  + 3 * 60 * 60 * 1000;
			
			// 创建订单记录
			connection.query(sqlMap.ordersql.cteateOrder,[oid, pay_state,disable_time], function(err, fields) {
				// 创建单条书籍记录
				// console.log("cteateOrder-err",err);
				// console.log("cteateOrder-fields",fields);
				connection.query(createInsertOrderItemsSql(oid,uid,books), function(err, fields) {
					// 计算订单总价
					// console.log("InsertOrderItems-err",err);
					// console.log("InsertOrderItems-fields",fields);
					// console.log("oid",oid);
					// console.log("uid",uid);
					// console.log("sqlMap",sqlMap.ordersql.getOrderCostAMount);
					connection.query(sqlMap.ordersql.getOrderCostAMount,[oid,uid], function(err, rows, fields) {
						// console.log("getOrderAmount-err",err);
						// console.log("getOrderAmount-rows",rows);
						// console.log("getOrderAmount-fields",fields);
						connection.query(sqlMap.ordersql.addOrderAmount,[rows[0].amount, oid], function(err, fields) {
							// 删除购物车记录
							var isbnArr = new Array();
							books.forEach(function(book){
								isbnArr.push(book.isbn);
							});
							connection.query(sqlMap.cartsql.deleteBooks,[uid,isbnArr.join(',')], function(err, fields) {
								
								// console.log("deleteBooks-fields",fields);
								if(typeof callback === 'function'){
									return callback('OK',oid);
								}
							});
						});
					});
				});
			});

			
		});
	},
	getAllOrders:function(uid, callback){
		// 获取所有未过期未付款的订单
		connection.query(sqlMap.ordersql.selectAll,[uid], function(err, rows, fields) {
			console.log(rows);
			if(typeof callback === 'function'){
				callback(err, rows);
			}
		});
	},
	getOneOrder:function(oid,uid,callback){
		connection.query(sqlMap.ordersql.selectByOid,[oid, uid], function(err, rows, fields) {
			console.log("getOneOrder-rows",rows);
			if(typeof callback === 'function'){
				callback(err, rows);
			}
		});
	}
};
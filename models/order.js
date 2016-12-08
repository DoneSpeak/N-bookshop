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

function createInParamsSql(sql, src){
	var inStr = src.join(',');
	// console.log("数组大小",src.length);
	// console.log("inStr",inStr);
	// console.log(inStr);
	inStr = "in(" + inStr + ")";
	// console.log(inStr);
	return sql.replace(/in\(\?\)/,inStr);
}

function createPutBackBooksSql(books){
		var isbnArr = new Array();
		var bookArr = new Array();

		var sql = "UPDATE tb_bookstore";
		sql += " SET num = CASE isbn";
		for(var i = 0; i < books.length; i ++){
			if(isbnArr.indexOf(books[i].isbn) < 0){
				isbnArr.push(books[i].isbn);
				bookArr[books[i].isbn] = 0;
			}
			bookArr[books[i].isbn] += books[i].num;
		}
		// console.log("isbnArr",isbnArr);
		// console.log("bookArr",bookArr);
		for(var i = 0; i < isbnArr.length; i ++){
			sql += " WHEN " + isbnArr[i] + " THEN num + " + bookArr[isbnArr[i]];
		}

		sql += " END";
		sql += " WHERE isbn IN ( " + isbnArr.join(',') + ")";
		// console.log("createPutBackBooksSql-sql",sql);
		return sql;
}

module.exports = {
	
	getAllOrders:function(uid, callback){
		// 获取所有未过期未付款的订单
		connection.query(sqlMap.ordersql.selectAll,[uid], function(err, rows, fields) {
			// console.log(rows);
			if(typeof callback === 'function'){
				callback(err, rows);
			}
		});
	},
	getOneOrder:function(oid,uid,callback){
		connection.query(sqlMap.ordersql.selectByOid,[oid, uid], function(err, rows, fields) {
			// console.log("getOneOrder-rows",rows);
			if(typeof callback === 'function'){
				callback(err, rows);
			}
		});
	},
	createOrder:function(uid, books, callback){
		var isbnArr = new Array();
		var book_incart_arr = new Array();
		// console.log("createOrder");
		for(var i = 0; i < books.length; i ++){
			// console.log("循环进入");
			isbnArr.push(books[i].isbn);
			book_incart_arr[books[i].isbn] = books[i].num;
			// console.log("循环");
		}
		// 获取数据库中的isbn和num数组
		// console.log(isbnArr.join(','));
		// console.log(book_incart_arr);
		var isbnSelectSql = createInParamsSql(sqlMap.booksql.selectBooksIsbnAndNumAndName,isbnArr);

		var selectSql = connection.query(isbnSelectSql, function(err, rows, fields) {
			var enough = true;

			// console.log("selectBooksIsbnAndNum-err",err);
			// console.log("selectBooksIsbnAndNum-rows",rows);
			// console.log("selectBooksIsbnAndNum-fields",fields);
			// 返回的rows 不可以用 for/in 结构进行迭代，否则迭代无效，应该使用for/i
			var lackBookList = new Array();
			for(var i = 0; i < rows.length; i ++) {
				// console.log("row.isbn",rows[i].isbn);
				// console.log("row.num",rows[i].num);
				// console.log("book_incart_arr[row.isbn] ",book_incart_arr[rows[i].isbn] );
				if(book_incart_arr[rows[i].isbn] > rows[i].num){
					// console.log("库存不足");
					enough = false;
					lackBookList.push("《" +rows[i].name + "》");
					// break;
				}
			}
			if(!enough){
				// 库存不足
				// console.log("enough",enough)
				if(typeof callback === 'function'){
					return callback('NOTENOUGH',null,lackBookList);
				}
			}
			// console.log("库存充足");
			// 更新库存数据
			for(var i = 0; i < books.length; i ++){
				// console.log("books",books[i].isbn);
				connection.query(sqlMap.ordersql.preOrder,[books[i].num,books[i].num,books[i].isbn],function(err, fields) {
					// console.log("preOrder-err",err);
					// console.log("preOrder-fields",fields);
					if(fields.affectedRows < 1){
						// console.log("库存没有了");
						// 虽然前面已经进行了判断，但是在高并发下这个函数会存在问题是，前面判断通过后，库存变少，导致这里没有起到效果
					}
				});
			}

			// 下单成功
			var pay_state = 0;
			// 利用添加时间的时间戳作为oid
			var oid = Date.now();
			// console.log("oid",oid);
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
							var delectBookSql = createInParamsSql(sqlMap.cartsql.deleteBooks,isbnArr);
							var sqlstr = connection.query(delectBookSql,[uid], function(err, fields) {
								
								// console.log("deleteBooks-fields",fields);
								if(typeof callback === 'function'){
									callback('OK',oid,new Array());
									return;
								}
							});

							// console.log("语句",sqlstr);
						});
					});
				});
			});
		});

		// console.log("查找",selectSql);
	},
	releaseAllDisableOrderOfOneUser:function(uid,callback){
		// 选择所有的未释放未付款的过期订单
		connection.query(sqlMap.ordersql.selectAllDisableAndNotPayOfOneUser,[uid], function(err, rows, fields) {
			
			if(rows.length < 1){
				// 没有需要处理的订单
				// console.log("没有需要处理的订单");
				return callback(err,fields);
			}
			// console.log("需要处理订单");
			// 将书本放会库存
			connection.query(createPutBackBooksSql(rows),function(err, fields) {
				// console.log("putBackBooks-err",err);
				// console.log("putBackBooks-fields",fields);
			});
			// 获取oid数组，注意rows中含有大量的重复oid信息
			var oidArr = new Array();
			for(var i = 0; i < rows.length; i ++){
					// console.log("下标",oidArr.indexOf(rows[i].oid));
				if(oidArr.indexOf(rows[i].oid) == -1){
					oidArr.push(rows[i].oid);
				}				
			}
			// 设置选择出来的订单位已释放
			var releaseOrderSql = createInParamsSql(sqlMap.ordersql.releaseOrder,oidArr);
			connection.query(releaseOrderSql,[uid],function(err, fields) {
				// console.log("putBackBooks-err",err);
				// console.log("putBackBooks-fields",fields);
				if(typeof callback === 'function'){
					callback(err,fields);
				}
			});
		});
	},
	releaseOrderOfByOid:function(oid, callback){
		// 选择选中的的未释放未付款的订单
		var sql = connection.query(sqlMap.ordersql.selectCancleOrderByOid, [oid], function(err, rows, fields) {
			// console.log("err",err);
			// console.log("rows",rows);
			// console.log("fields",fields);
			if(rows.length < 1){
				// 订单不存在或者已经释放
				return callback("NOTEXIST");
			}
			// 将书本放回库存
			connection.query(createPutBackBooksSql(rows),function(err, fields) {
				// console.log("putBackBooks-err",err);
				// console.log("putBackBooks-fields",fields);
			});
			
			// 设置选择出来的订单为已释放
			var sql = connection.query(sqlMap.ordersql.releasedOneOrderByOid,[oid],function(err, fields) {
				// console.log("releasedOneOrderByOid-err",err);
				// console.log("releasedOneOrderByOid-fields",fields);
				if(typeof callback === 'function'){
					callback("OK");
				}
			});
			// console.log("releaseOrderOfByOid-sql",sql);
		});
		// console.log("selectCancleOrderByOid-sql",sql);
	}
};


// cteateOrder:function(uid, books, callback){
// 		// 设置事务起点
// 		connection.query(sqlMap.common.saveStartPoint,function(err, fields) {
// 			// console.log("begin-err",err);
// 			// console.log("begin-fields",fields);
// 			var have = true;
// 			for(var i = 0; i < books.length && have; i ++){
// 				// 预下单，从库存中减少相应书本数
// 				console.log("books",books[i].isbn);
// 				connection.query(sqlMap.ordersql.preOrder,[books[i].num,books[i].num,books[i].isbn],function(err, fields) {
// 					console.log("preOrder-err",err);
// 					console.log("preOrder-fields",fields);
// 					if(fields.affectedRows < 1){
// 						console.log("库存没有了");
// 						have = false;
// 					}
// 				});
// 			}
// 			// 由于异步的执行导致have并不一定是最新的值
// 			if(!have){
// 				// 库存没有,回滚所有更新操作
// 				mysqlModel.rollBackToStartPoint();
// 				if(typeof callback === 'function'){
// 					callback('NOTENOUGH',null);
// 					return;
// 				}
// 			}else{
// 				mysqlModel.commit();
// 			}

// 			// 下单成功
// 			var pay_state = 0;
// 			// 利用添加时间的时间戳作为oid
// 			var oid = Date.now();
// 			console.log("oid",oid);
// 			// 3小时下单
// 			var disable_time = oid  + 3 * 60 * 60 * 1000;
			
// 			// 创建订单记录
// 			connection.query(sqlMap.ordersql.cteateOrder,[oid, pay_state,disable_time], function(err, fields) {
// 				// 创建单条书籍记录
// 				// console.log("cteateOrder-err",err);
// 				// console.log("cteateOrder-fields",fields);
// 				connection.query(createInsertOrderItemsSql(oid,uid,books), function(err, fields) {
// 					// 计算订单总价
// 					// console.log("InsertOrderItems-err",err);
// 					// console.log("InsertOrderItems-fields",fields);
// 					// console.log("oid",oid);
// 					// console.log("uid",uid);
// 					// console.log("sqlMap",sqlMap.ordersql.getOrderCostAMount);
// 					connection.query(sqlMap.ordersql.getOrderCostAMount,[oid,uid], function(err, rows, fields) {
// 						// console.log("getOrderAmount-err",err);
// 						// console.log("getOrderAmount-rows",rows);
// 						// console.log("getOrderAmount-fields",fields);
// 						connection.query(sqlMap.ordersql.addOrderAmount,[rows[0].amount, oid], function(err, fields) {
// 							// 删除购物车记录
// 							var isbnArr = new Array();
// 							books.forEach(function(book){
// 								isbnArr.push(book.isbn);
// 							});
// 							connection.query(sqlMap.cartsql.deleteBooks,[uid,isbnArr.join(',')], function(err, fields) {
								
// 								// console.log("deleteBooks-fields",fields);
// 								if(typeof callback === 'function'){
// 									callback('OK',oid);
// 									return;
// 								}
// 							});
// 						});
// 					});
// 				});
// 			});

			
// 		});
// 	},


// UPDATE tb_bookstore
//     SET num = CASE oid
//         WHEN 1481112502689 THEN 
//         	CASE isbn
//         		WHEN 9787115318978 THEN num + 100
//         	END
//         WHEN 1481113260179 THEN
//        		CASE isbn
//         		WHEN 9787115318978 THEN num + 100
//         		WHEN 9787115351531 THEN num + 100
//         		WHEN 9787115369796 THEN num + 100
//         	END
//         WHEN 1481115143140 THEN
//         	CASE isbn
//         		WHEN 9787115369796 THEN num + 100
//         	END
//     END
// WHERE oid IN (1481112502689,1481113260179,1481115143140) and isbn IN (9787115318978,9787115351531,9787115369796);
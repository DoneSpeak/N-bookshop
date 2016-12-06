var mysql = require('mysql');
var config = require('config-lite');
var sqlMap = require('./sqlMap');
 
// 使用连接池，提升性能
var connection  = mysql.createConnection(config.mysql);

module.exports = {
	getNormalBooks: function ( callback) {

		connection.query(sqlMap.booksql.selectN, function(err, rows, fields) {
			
			if( typeof callback == 'function'){
				callback(err, rows, fields);
			}			
		});
	},
	getSnapupBooks: function ( callback) {

		connection.query(sqlMap.booksql.selectS, function(err, rows, fields) {
			
			if( typeof callback == 'function'){
				callback(err, rows, fields);
			}			
		});
	}
};
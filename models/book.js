var mysql = require('mysql');
var config = require('config-lite');
var sqlMap = require('./sqlMap');

module.exports = {
	getNormalBooks: function ( callback) {
		var connection  = mysql.createConnection(config.mysql);
		connection.query(sqlMap.booksql.selectN, function(err, rows, fields) {
			
			if( typeof callback == 'function'){
				callback(err, rows, fields);
				connection.end();
			}			
		});
	},
	getSnapupBooks: function ( callback) {
		var connection  = mysql.createConnection(config.mysql);
		connection.query(sqlMap.booksql.selectS, function(err, rows, fields) {
			var connection  = mysql.createConnection(config.mysql);
			if( typeof callback == 'function'){
				callback(err, rows, fields);
				connection.end();
			}			
		});
	}
};
var mysql = require('mysql');
var config = require('config-lite');
var sqlMap = require('./sqlMap');
 
// 提升性能
var connection  = mysql.createConnection(config.mysql);

module.exports = {
	rollBackAndCommit:function(){
		connection.query(sqlMap.common.rollBackAndCommit,function(err, fields){
			// console.log("回滚");
			// console.log("rollBackAndCommit-fields",fields);
		});
	},
	commit:function(){
		connection.query(sqlMap.common.commit,function(err, fields){
			// console.log('commit');
			// console.log("commit-fields",fields);
		});
	},
	rollBackToStartPoint:function(){
		connection.query(sqlMap.common.rollbackToStartOrder,function(err, fields){
			// console.log('rollbackToStartOrder');
			// console.log("rollbackToStartOrder-fields",fields);
		});
	}
}

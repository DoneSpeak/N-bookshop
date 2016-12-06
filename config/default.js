//用于config-lite
//作为默认设置
module.exports ={
	session:{
		secret:'bookshop',
		key:'bookshop',
		secret_string:'this_project_is_so_hard',
		maxAge:18000000
		// 5小时
	},
	mysql: {
		host: 'localhost', 
		post: 3306,
		user: 'carfield',
		password: 'cat123',
		database:'db_bookshop'
	},
	time:{
		snap_time:'12:00:00',
		snap_day:2,
		seckill_time:'12:00:00',
		seckill_day:4
	}
};
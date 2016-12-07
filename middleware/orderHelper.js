var moment = require('moment');

module.exports = {

	// 将返回的数据创建成对象类型
	// orders = [{oid,amount,disabletime,book:[{name,price,bookamount}]}]
	createOrders:function(rows){
		function createBook(){
			var book = {
					name:"",
					price:"",
					num:"",
					bookamount:""
				};
			return book;
		}

		function createOrder(){
			var order = {
					oid:"",
					amount:"",
					books:""
				};
			return order;
		}

		var orders = new Array();
		var books = new Array();
		// rows 已经按照oid排序
		var oid = "";
		for(var i = 0; i < rows.length;){
			if(oid != rows[i].oid){
				oid = rows[i].oid;
				var order = createOrder();
				order.oid = oid;
				order.amount = rows[i].amount;
				order.disabletime = moment(rows[i].disabletime).format('YYYY/MM/DD/HH:mm');
				order.books = new Array();
				// 第一本书
				for(;i < rows.length && oid === rows[i].oid; i ++){
					var book = createBook();
					book.name = rows[i].name;
					book.price = rows[i].price;
					book.num = rows[i].num;
					book.bookamount = rows[i].bookamount;

					order.books.push(book);
				}
				orders.push(order);
			}
		}
		return orders;
	}
}
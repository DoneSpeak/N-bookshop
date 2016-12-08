//增删查改的sql语句
var usersql = {
	insert:'insert into tb_user(name,password) values(?,?)',
	selectByName:'select * from tb_user where name=?'
};

var booksql = {
	// select的字段名为rows的属性名
	selectN:"select B.isbn,B.name,B.intro,B.price,B.price_original,B.img,S.num from tb_book B,tb_bookstore S where B.state='n' and B.isbn=S.isbn",
	selectS:"select * from tb_book where state='s' limit 1",
	selectBooksIsbnAndNum:"select isbn,num from tb_bookstore where isbn in(?)",
	selectBooksIsbnAndNumAndName:"select B.name,S.isbn,S.num from tb_bookstore S,tb_book B where S.isbn=B.isbn and S.isbn in(?)"
};

var cartsql = {
	selectAll:"select B.isbn, B.name, B.price, C.num, (C.num * B.price) as amount from tb_cart C,tb_book B where C.uid= ? and C.isbn = B.isbn order by B.isbn",
	existBook:"select 1 from tb_cart where uid = ? and isbn = ? limit 1",
	bookNumInc:"update tb_cart set num = num + 1 where uid=? and isbn=?",
	bookNumReset:"update tb_cart set num = ? where uid=? and isbn=?",
	addOneBook:"insert into tb_cart(uid,isbn,num) values(?,?,1)",
	countBookNum:"select sum(num) as bookNum from tb_cart where uid=?",
	subOneBook:"update tb_cart set num = num - 1 where uid=? and isbn=?",
	getOneTypeBookNum:"select num from tb_cart where uid=? and isbn=?",
	deleteOneTypeBook:"delete from tb_cart where uid=? and isbn=?",
	deleteBooks:"delete from tb_cart where uid=? and isbn in(?)",
	checkCanAddBook:"select (S.num - C.num) as bookleft from tb_cart C, tb_bookstore S where C.uid=? and C.isbn=?"
};

var ordersql = {
	preOrder:"update tb_bookstore set num = num - ? where num >= ? and isbn = ?",

	putBackBooks:"update tb_bookstore set num = num + ? where isbn = ?",

// 请保证"in(?)"字符串之间没有空格
	releaseOrder:"update tb_order set released = 1 where oid in(?)"

	cteateOrder:"insert into tb_order(oid, payed, disabletime) values(?,?,?)",

	selectAll:"select O.oid, B.name, B.price,OUB.num,(OUB.num * B.price ) as bookamount, O.amount, O.disabletime \
from tb_book B,tb_order_user_book OUB,tb_order O \
where OUB.uid=? and B.isbn=OUB.isbn and OUB.oid=O.oid and unix_timestamp()*1000 < O.disabletime and O.payed=0 order by O.oid",

	selectByOid:"select O.oid, B.name, B.price,OUB.num,(OUB.num * B.price ) as bookamount, O.amount, O.disabletime \
from tb_book B,tb_order_user_book OUB,tb_order O \
where O.oid=? and OUB.uid=? and B.isbn=OUB.isbn and OUB.oid=O.oid and unix_timestamp()*1000 < O.disabletime",

	// 选择未释放的过期且未付款订单
	selectAllDisableAndNotPay:"select OUB.oid,OUB.isbn,OUB.num from tb_order O,tb_order_user_book OUB \
where O.oid = OUB.oid and O.released=0 and unix_timestamp()*1000 >= O.disabletime and O.payed=0 order by O.oid ",

	selectAllDisableAndNotPayOfOneUser:"select OUB.oid,OUB.isbn,OUB.num from tb_order O,tb_order_user_book OUB \
where OUB.uid=? and O.oid = OUB.oid and O.released=0 and unix_timestamp()*1000 >= O.disabletime and O.payed=0 order by O.oid ",

	getOrderCostAMount:"select sum(OUB.num * B.price) as amount from tb_book B,tb_order_user_book OUB,tb_order O \
where O.oid=? and OUB.uid=? and B.isbn=OUB.isbn and OUB.oid=O.oid",

	addOrderAmount:"update tb_order set amount=? where oid=?"
};

var bookstore = {
	getBookStoreNum:"select num from tb_bookstore where isbn=?",
	subOneBook:"update tb_bookstore set num = num - 1 where isbn=? and num > 0"
};

var common = {
	begin:"begin",
	saveStartPoint:"savepoint startPoint",
	rollback:"rollback",
	rollbackToStartOrder:"rollback to startPoint",
	rollbackAndCommit:'rollback;commit',
	commit:"commit;"
};

module.exports = {
	usersql:usersql,
	booksql:booksql,
	cartsql:cartsql,
	ordersql:ordersql,
	bookstore:bookstore,
	common:common
};


// select O.oid, B.name, B.price,OUB.num,(OUB.num * B.price ) as bookamount ,O.amount,O.disabletime
// from tb_book B,tb_order_user_book OUB,tb_order O 
// where OUB.uid=11 and B.isbn=OUB.isbn and OUB.oid=O.oid and unix_timestamp() <= O.disabletime and O.payed=0;


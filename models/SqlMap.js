//增删查改的sql语句
var usersql = {
	insert:'insert into tb_user(name,password) values(?,?)',
	selectByName:'select * from tb_user where name=?',
	update:'update tb_user set name=?, age=? where id=?',
	delete: 'delete from tb_user where uid=?',
	queryById: 'select * from tb_user where uid=?',
	queryAll: 'select * from user'
};

var booksql = {
	// select的字段名为rows的属性名
	selectN:"select B.isbn,B.name,B.intro,B.price,B.price_original,B.img,S.num from tb_book B,tb_bookstore S where B.state='n' and S.num and B.isbn=S.isbn",
	selectS:"select * from tb_book where state='s' limit 1"
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
	deleteOneTypeBook:"delete from tb_cart where uid=? and isbn=?"
};

var bookstore = {
	getBookStoreNum:"select num from tb_bookstore where isbn=?",
	subOneBook:"update tb_bookstore set num = num - 1 where isbn=? and num > 0"
};

module.exports = {
	usersql:usersql,
	booksql:booksql,
	cartsql:cartsql,
	bookstore:bookstore
};

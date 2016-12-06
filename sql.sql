-- start - [n,k,s,o] n-一般，k-秒抢，s-抢购， o 缺货
insert into 
	tb_book(ISBN,name,author,publish_company,publish_time,intro,price,price_original,state) 
	values('9787115351531','图解HTTP','[日]上野宣','人民邮电出版社','2014-05-01','https安全通道解析，nginx服务器精解宝典，http权威指南！',38.7,49,'n');

insert into 
	tb_book(ISBN,name,author,publish_company,publish_time,intro,price,price_original,state) 
	values('9787115351531',
		'图解HTTP',
		'[日]上野宣',
		'人民邮电出版社',
		'2014-05-01',
		'https安全通道解析，nginx服务器精解宝典，http权威指南！',
		38.7,
		49,
		'n');
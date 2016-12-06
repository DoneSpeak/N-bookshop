module.exports = function(app){
	app.get('/',function(req, res){
		res.redirect('./bookindex');
	});

	app.use('/bookindex',require('./bookindex'));

	app.use('/login',require('./login'));

	app.use('/signin',require('./signin'));

	app.use('/newbook',require('./newbook'));

	app.use('/cart',require('./cart'));

	app.use('/orderlist',require('./orderlist'));

	app.use('/pay',require('./pay'));

	app.use('/logout',require('./logout'));

	app.use('/mysql',require('./mysql'));
};
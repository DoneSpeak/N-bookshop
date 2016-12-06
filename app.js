var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var pkg = require('./package');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var MySQLStore = require('express-mysql-session')(session);
var config = require('config-lite');
var flash = require('connect-flash');

var app = express();

var routes = require('./routes');

// 设置模板路径
app.set('views', path.join(__dirname, 'views'));
// 设置模板引擎
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// session 中间件
var sessionStore = new MySQLStore(config.mysql);
//MySQLStore会自动创建一个名为session数据表格，包含的字段为：session_id,expire,data
// 所以需要用到可以创建表格的用户才行，之前是用的用户加菲猫只能增删查改，所以一直无法创建出session的表格
// 导致没有存储到session，就会马上点击下线了
app.use(session({
    name: config.session.key,// 设置 cookie 中保存 session id 的字段名称
    secret: config.session.secret,// 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
    store:sessionStore,
    cookie: {
        maxAge: config.session.maxAge// 过期时间，过期后 cookie 中的 session id 自动删除
    },
    resave:false,
    saveUninitialized:true
}));

app.use(flash());
// 设置模板全局常量
app.locals.bookshop = {
    title: pkg.name
};

// 添加模板必需变量
//用于显示通知设置
app.use(function (req, res, next) {
    console.log(req.session);
    res.locals.user = req.session.user;
    res.locals.error = req.flash('error').toString();
    console.log('user',res.locals.user);
    next();
});

routes(app);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

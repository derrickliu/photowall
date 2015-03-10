var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('hbs');
var session = require('express-session');

var multer  = require('multer');

var fs = require('fs');

var routes = require('./routes/index');
var user = require('./routes/user');
var login = require('./routes/login');
var logout = require('./routes/logout');
var reg = require('./routes/reg');
var upload = require('./routes/upload');


var mongoStore = require("connect-mongo")(session);
var store = new mongoStore({
    db: "session"
});

var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html',hbs.__express);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
//
// var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'});
// app.use(logger('combined', {stream: accessLogStream}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
var cache = 24 * 60 * 60 * 1000;
app.use(express.static(path.join(__dirname, 'public'),{maxAge: cache}));
app.use(express.static(path.join(__dirname, 'uploads'),{maxAge: cache}));
app.use(express.static(path.join(__dirname, 'cache'),{'Content-Type': 'text/cache-manifest'}));
app.use(multer({ 
    dest: './uploads/'
    // rename: function(fieldname, filename){
    //     return filename.replace(/\W+/g, '-').toLowerCase() + Date.now()
    // }
    // onFileUploadComplete: function(file){
    // }
}));



app.use(session({
    secret: 'http://localhost:3000',
    cookie: { maxAge: cache },
    store: store
}));

app.use(function(req, res, next){
    res.locals.user = req.session.user;
    next();
});

app.use('/', routes);
app.use('/index', routes);
app.use('/user', user);
app.use('/login', login);
app.use('/logout', logout);
app.use('/reg', reg);
app.use('/upload', upload);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});




module.exports = app;

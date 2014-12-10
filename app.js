var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
var server = require('http').Server(app);
var fs = require('fs');
var io = require('socket.io')(server);

var mongoose = require('mongoose');
var pageview = require('./models/pageview');

var spawn = require('child_process').spawn;

mongoose.connect('mongodb://127.0.0.1/test1');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* GET home page. */
var router = express.Router();
router.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
});
app.use('/', router);


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

io.on('connection', function(socket){
    var encChild = spawn('avconv', "-y -f image2pipe -s 1280x720 -c:v mjpeg -pix_fmt rgb24 -i - -an -c:v libx264 -pix_fmt yuv420p -f mpegts out/test.ts".split(" "));

    encChild.on('close', function(code){
        console.log('avconv closed: ' + code);
    })
    encChild.stderr.setEncoding('utf8')
    encChild.stderr.on('data', function(data){
        console.log(data);
    });
    encChild.stdout.setEncoding('utf8')
    encChild.stdout.on('data', function(data){
        console.log(data);
    });
    
    socket.on('frame', function(b64){
        var buf = new Buffer(b64, 'base64');
        encChild.stdin.write(buf);
    });

    socket.on('disconnect', function(){
        encChild.kill();
    })
});


module.exports = {
    app: app,
    server: server
};

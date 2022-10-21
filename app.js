var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

// var indexRouter = require('./routes/index');
require('dotenv')

const { PrismaClient } = require('@prisma/client')

var app = express();

app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://bengalread.vercel.app',
    'https://bengalread.netlify.app',
    'https://bengalread.com',
  ],
  credentials: true,
}))

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.json({limit: '2mb'}));
app.use(express.urlencoded({
  extended: true,
  // limit: '5mb'
}));
app.use(express.static(path.join(__dirname, 'public')));

const prismaClient = async function (req, res, next) {
  req.prisma = new PrismaClient()
  next()
}

app.use(prismaClient)

require('./routes')(app)

// app.use('/api', indexRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

module.exports = app;

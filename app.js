var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

const { PrismaClient } = require('@prisma/client')

var indexRouter = require('./routes/index');

const configure = require('dotenv')

var app = express();

app.use(cors())

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const prismaClient = async function (req, res, next) {
  req.prisma = new PrismaClient()
  next()
}

app.use(prismaClient)

app.use('/api', indexRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
module.exports = app;

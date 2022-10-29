var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const session = require('cookie-session')
const helmet = require('helmet')
// var indexRouter = require('./routes/index');
require("dotenv").config()

const { PrismaClient } = require('@prisma/client');
const consoleLog = require('./app/Helpers/consoleLog');
const useragent = require('express-useragent')

var app = express();

app.set('trust proxy', 1)

app.use(helmet())

app.disable('x-powered-by')

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://bengalread.vercel.app',
    'https://bengalread.netlify.app',
    'https://bengalread.com',
  ],
  credentials: true,
}))

const expiryDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

app.use(session({
  name: 'sessionId',
  secret: process.env.REFRESH_TOKEN_SECRET,
  // keys: ['key1', 'key2'],
  cookie: {
    secure: true,
    httpOnly: true,
    // domain: 'example.com',
    // path: 'foo/bar',
    expires: expiryDate
  }
}))


// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({
  extended: true,
  // limit: '5mb'
}));
app.use(express.static(path.join(__dirname, 'public')));

const prisma = new PrismaClient()

app.use(function (req, res, next) {

  req.prisma = prisma

  req.on('finish', async () => {

    await prisma.$disconnect()

  })

  next()
})


app.use(function (req, res, next) {
  
  const ua = useragent.parse(req.headers['user-agent'])

  const device = ua.isAndroid ? 'phone'
    : ua.isWindows ? 'desktop'
      : ua.isWindowsPhone ? 'phone'
        : ua.isTablet ? 'tab'
          : ua.isAndroidTablet ? 'tab'
            : ua.isLinux ? 'desktop'
              : ua.isLinux64 ? 'desktop'
                : ua.isMac ? 'desktop'
                  : ua.isMobile ? 'phone'
                    : ua.isiPhone ? 'phone'
                      : ua.isiPod ? 'tab'
                        : ua.isiPad ? 'tab'
                          : 'unknown'

  const os = ua.os
  const platform = ua.platform
  const browser = ua.browser

  const userAgent = { device, os, platform, browser }

  req.ua = userAgent

  // console.log('User Agent from middleware', userAgent)

  next()
})


require('./routes')(app)

// app.use('/api', indexRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

module.exports = app;

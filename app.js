var createError = require('http-errors');
const compression = require('compression')
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

var http = require("http");
var socketio = require("socket.io");
var app = express();

app.use(compression())
// Create the http server
const server = require('http').createServer(app);

// Create the Socket IO server on 
// the top of http server
const io = socketio(server, {
  cors: {
    origin: '*'
  }
});

let users = []

const addUser = (user, socketId) => {
  !users.some(usr => usr.socketId == socketId) && users.push({ ...user, socketId })
}

const removeUser = (socketId) => {

  consoleLog('removing socket id', socketId)

  users = users.filter(usr => usr.socketId != socketId)
}


io.on('connection', socket => {
  //Take user ID and Socket ID
  consoleLog('Socket client connected with server', '')

  // When a user connect
  socket.on('addUser', (user) => {

    // consoleLog('Socket user added', user)

    addUser(user, socket.id)

    io.emit('socketUsers', users)

  })


  // const getUser = (userId) => {
  //     return users.find(user => user.userId == userId)
  // }

  // socket.on('messageSent', async ({ senderId, receiverId, message }) => {
  //     const user = getUser(receiverId)
  //     io.to(user?.socketId).emit('messageReceived', { senderId, message })
  //     io.emit('updateMessanger', senderId)
  // })

  // socket.on('userTyping', async ({ senderId, receiverId }) => {

  //     const user = getUser(receiverId)

  //     io.to(user?.socketId).emit('userTypingReceived', senderId)

  // })

  // appSocket(io, socket)

  // When a user disconnect
  socket.on('disconnect', () => {

    console.log('Socket client disconnected from server')

     removeUser(socket.id)

    io.emit('socketUsers', users)
  })


})


app.set('trust proxy', 1)

app.use(helmet())

app.disable('x-powered-by')

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://shamantorik.vercel.app',
    'https://shamantorik.netlify.app',
    'https://shamantorik.com',
    'https://www.shamantorik.com'
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

module.exports = { app, server };

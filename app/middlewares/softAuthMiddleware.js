const jwt = require('jsonwebtoken')
const consoleLog = require('../Helpers/consoleLog')

const softAuthMiddleware = (req, res, next) => {

    const authHeader = req.headers.authorization || req.headers.Authorization 

    if(!authHeader?.startsWith('Bearer ')) return next()

    const token = authHeader.split(' ')[1]

    jwt.verify(

        token,

        process.env.ACCESS_TOKEN_SECRET,

        (err, decoded) => {

            if(err) return next()

            // consoleLog('softMiddleware User', decoded)

            req.user = decoded
            req.role = decoded.role

            next()
        }
    )

}

module.exports = softAuthMiddleware
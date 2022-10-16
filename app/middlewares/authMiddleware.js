const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {

    const authHeader = req.headers.authorization || req.headers.Authorization 

    if(!authHeader?.startsWith('Bearer ')) return res.status(401).json({msg: 'Unauthorized'})

    const token = authHeader.split(' ')[1]

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if(err) return res.status(401).json({msg: 'Unauthorized'})
            req.user = decoded
            req.role = decoded.role
            next()
        }
    )

}

module.exports = authMiddleware
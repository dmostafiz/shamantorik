const jwt = require('jsonwebtoken')

const authorizeProfileUpdate = (req, res, next) => {

    const authHeader = req.headers.authorization || req.headers.Authorization 

    
    if(!authHeader?.startsWith('Bearer ')) return res.status(401).json({msg: 'Unauthorized'})
    
    const token = authHeader.split(' ')[1]

    // console.log('authHeader$$$$$$$$$$$', token)

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if(err) return res.json({ok: false, msg: 'Unauthorized'})
            req.decoded = decoded,
            next()
        }
    )

}

module.exports = authorizeProfileUpdate
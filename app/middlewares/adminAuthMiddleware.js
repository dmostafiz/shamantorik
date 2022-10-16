const adminAuthMiddleware = (req, res, next) => {

    req.isAdmin = 'checking if the user is admin or not'

    next()
}

module.exports = adminAuthMiddleware
const { Router } = require("express")
const { search } = require("../app/controllers/SystemController")
const authMiddleware = require("../app/middlewares/authMiddleware")
const router = Router()

router.get('/search/:searchFor/:q', search)

module.exports = router
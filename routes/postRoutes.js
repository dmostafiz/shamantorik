const { Router } = require("express")
const { createPost } = require("../app/controllers/PostsController")
const authMiddleware = require("../app/middlewares/authMiddleware")
const router = Router()

router.post('/', [authMiddleware], createPost)

module.exports = router
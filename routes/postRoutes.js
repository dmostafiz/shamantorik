const { Router } = require("express")
const { createPost, updatePost, getEditingPost } = require("../app/controllers/PostsController")
const authMiddleware = require("../app/middlewares/authMiddleware")
const router = Router()

router.post('/', [authMiddleware], createPost)
router.get('/editing_post/:postId', [authMiddleware], getEditingPost)
router.post('/update', [authMiddleware], updatePost)

module.exports = router
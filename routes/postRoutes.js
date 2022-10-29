const { Router } = require("express")
const { createPost, updatePost, getEditingPost, latestPost, getPostById, storePostTraffic } = require("../app/controllers/PostsController")
const authMiddleware = require("../app/middlewares/authMiddleware")
const softAuthMiddleware = require("../app/middlewares/softAuthMiddleware")
const router = Router()

router.get('/', latestPost)
router.get('/getSinglePost/:postId', getPostById)

router.post('/', [authMiddleware], createPost)
router.get('/editing_post/:postId', [authMiddleware], getEditingPost)

router.post('/storePostTraffic/:postId', softAuthMiddleware, storePostTraffic)

router.post('/update', [authMiddleware], updatePost)

module.exports = router
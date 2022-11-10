const { Router } = require("express")
const { createPost, updatePost, getEditingPost, latestPost, getPostById, storePostTraffic, postLike, postImageUploader, storeComment, getPostComments, getTopPost, getLatestComments } = require("../app/controllers/PostsController")
const authMiddleware = require("../app/middlewares/authMiddleware")
const softAuthMiddleware = require("../app/middlewares/softAuthMiddleware")
const router = Router()

router.get('/', latestPost)

router.get('/getSinglePost/:postId', getPostById)

router.get('/get_top_posts/:limit', getTopPost)

router.post('/', [authMiddleware], createPost)
router.get('/editing_post/:postId', [authMiddleware], getEditingPost)

router.post('/storePostTraffic/:postId', softAuthMiddleware, storePostTraffic)

router.post('/update', [authMiddleware], updatePost)

router.post('/like/:postId', [authMiddleware], postLike)

router.post('/image_upload', postImageUploader)

router.post('/store_comment', [authMiddleware], storeComment)

router.get('/get_post_comments/:postId', getPostComments)

router.get('/latest_comments/:limit', getLatestComments)

module.exports = router
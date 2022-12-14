const { Router } = require("express")
const { createPost, updatePost, getEditingPost, latestPost, getPostById, storePostTraffic, postLike, postImageUploader, storeComment, getPostComments, getTopPost, getLatestComments, allPost } = require("../app/controllers/PostsController")
const authMiddleware = require("../app/middlewares/authMiddleware")
const softAuthMiddleware = require("../app/middlewares/softAuthMiddleware")
const router = Router()
var cacheService = require("express-api-cache");
const responseCache = require("../app/middlewares/cacheMiddleware")
var cache = cacheService.cache;

//XML sitemap
router.get('/all', allPost)
//XML sitemap


router.get('/', [cache('5 minute'), responseCache], latestPost)

router.get('/getSinglePost/:postId', getPostById)

router.get('/get_top_posts/:limit',[cache('1 day'), responseCache], getTopPost)

router.post('/', [authMiddleware], createPost)

router.get('/editing_post/:postId', [authMiddleware], getEditingPost)

router.post('/storePostTraffic/:postId', softAuthMiddleware, storePostTraffic)

router.post('/update', [authMiddleware], updatePost)

router.post('/like/:postId', [authMiddleware], postLike)

router.post('/image_upload', postImageUploader)

router.post('/store_comment', [authMiddleware], storeComment)

router.get('/get_post_comments/:postId', getPostComments)

router.get('/latest_comments/:limit', [cache('1 day'), responseCache], getLatestComments)



module.exports = router
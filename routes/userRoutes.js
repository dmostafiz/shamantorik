const { Router } = require("express")
const { checkUserExist, getAuthDraftedPosts, getBlogger, getTopBloggers } = require("../app/controllers/UsersController")
const authMiddleware = require("../app/middlewares/authMiddleware")

const router = Router()

router.get('/profile', (req, res) => {

    res.json('User Profile')
})

router.get('/blogger/:userId', getBlogger)

router.get('/get_top_ranked/:limit', getTopBloggers)

router.get('/author_drafted_posts', authMiddleware, getAuthDraftedPosts)

router.post('/check_user_exists', checkUserExist)

module.exports = router
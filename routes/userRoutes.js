const { Router } = require("express")
const { checkUserExist, getAuthDraftedPosts } = require("../app/controllers/UsersController")
const authMiddleware = require("../app/middlewares/authMiddleware")

const router = Router()

router.get('/profile', (req, res) => {

    res.json('User Profile')
})

router.get('/author_drafted_posts', authMiddleware, getAuthDraftedPosts)

router.post('/check_user_exists', checkUserExist)

module.exports = router
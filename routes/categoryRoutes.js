const { Router } = require("express")
const { createAllCategory, getAllCategory, getPostsByCategory, getOneCategory, getTopCategories } = require("../app/controllers/CategoryController")
const router = Router()

router.get('/', getAllCategory)
router.get('/single/:categoryId', getOneCategory)
router.get('/top_categories', getTopCategories)
router.get('/create', createAllCategory)
router.get('/posts/:id', getPostsByCategory)

// router.post('/check_user_exists', checkUserExist)

module.exports = router
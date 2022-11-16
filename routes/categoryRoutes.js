const { Router } = require("express")
const { createAllCategory, getAllCategory, getPostsByCategory, getOneCategory, getTopCategories } = require("../app/controllers/CategoryController")
const router = Router()
var cacheService = require("express-api-cache");
var cache = cacheService.cache;

router.get('/',cache("5 minute"), getAllCategory)
router.get('/single/:categoryId',cache("5 minute"), getOneCategory)
router.get('/top_categories',cache("5 day") , getTopCategories)
router.get('/create', createAllCategory)
router.get('/posts/:id',cache("5 minute"), getPostsByCategory)

// router.post('/check_user_exists', checkUserExist)

module.exports = router
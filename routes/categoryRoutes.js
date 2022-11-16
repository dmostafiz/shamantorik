const { Router } = require("express")
const { createAllCategory, getAllCategory, getPostsByCategory, getOneCategory, getTopCategories } = require("../app/controllers/CategoryController")
const router = Router()
var cacheService = require("express-api-cache");
const responseCache = require("../app/middlewares/cacheMiddleware");
var cache = cacheService.cache;

router.get('/',[cache("1 day"), responseCache], getAllCategory)
router.get('/single/:categoryId',cache("5 minute"), getOneCategory)
router.get('/top_categories',[cache("5 day"), responseCache] , getTopCategories)
router.get('/create', createAllCategory)
router.get('/posts/:id',[cache("5 minute"), responseCache], getPostsByCategory)

// router.post('/check_user_exists', checkUserExist)

module.exports = router
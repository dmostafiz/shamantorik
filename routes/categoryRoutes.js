const { Router } = require("express")
const { createAllCategory, getAllCategory } = require("../app/controllers/CategoryController")
const router = Router()

router.get('/', getAllCategory)
router.get('/create', createAllCategory)

// router.post('/check_user_exists', checkUserExist)

module.exports = router
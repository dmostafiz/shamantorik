const { Router } = require("express")
const { createAllCategory } = require("../app/controllers/CategoryController")
const router = Router()

router.get('/create', (req, res) => {

    res.json('Create All Category')
})

// router.post('/check_user_exists', checkUserExist)

module.exports = router
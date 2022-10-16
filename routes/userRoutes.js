const { Router } = require("express")
const { checkUserExist } = require("../app/controllers/UsersController")
const router = Router()

router.get('/profile', (req, res) => {

    res.json('User Profile')
})

router.post('/check_user_exists', checkUserExist)

module.exports = router
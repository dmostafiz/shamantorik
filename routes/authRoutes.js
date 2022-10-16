const { Router } = require("express")
const router = Router()
const { getUsers } = require('../app/controllers/UsersController');
const adminAuthMiddleware = require('../app/middlewares/adminAuthMiddleware');
const authMiddleware = require('../app/middlewares/authMiddleware');
const { emailSignIn, emailSignup, socialSignIn, socialSignup, refereshToken, logout } = require('../app/controllers/AuthController');


router.get('/', getUsers);
router.post('/signIn', emailSignIn);
router.post('/signUp', emailSignup);
router.post('/social_signin', socialSignIn)
router.post('/social_signup', socialSignup)
router.post('/refresh', refereshToken)
router.post('/logout', logout)

module.exports = router

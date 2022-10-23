const { Router } = require("express")
const router = Router()
const { getUsers } = require('../app/controllers/UsersController');
const adminAuthMiddleware = require('../app/middlewares/adminAuthMiddleware');
const authMiddleware = require('../app/middlewares/authMiddleware');
const { emailSignIn, emailSignup, socialSignIn, socialSignup, refereshToken, logout, authorizeUpdate_token, updateInitialProfileInfo, updateInitialUsernamePassword, getAuthorisedUser } = require('../app/controllers/AuthController');
const authorizeProfileUpdate = require("../app/middlewares/authorizeProfileUpdate");


router.get('/', getUsers);
router.post('/signIn', emailSignIn);
router.post('/signUp', emailSignup);
router.post('/social_signin', socialSignIn)
router.post('/social_signup', socialSignup)
router.post('/refresh', refereshToken)
router.post('/logout', authMiddleware, logout)
router.get('/get_authorised_user',authMiddleware, getAuthorisedUser)

router.post('/update_initial_profile_info',authorizeProfileUpdate, updateInitialProfileInfo)
router.post('/update_initial_usernamePassword',authorizeProfileUpdate, updateInitialUsernamePassword)
router.post('/authorize_initial_acc_update_token',authorizeProfileUpdate, authorizeUpdate_token)

module.exports = router

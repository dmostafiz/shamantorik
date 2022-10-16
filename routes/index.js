var express = require('express');
const { emailSignIn, emailSignup, socialSignIn, socialSignup, refereshToken, logout } = require('../app/controllers/AuthController');
var router = express.Router();
const { getUsers } = require('../app/controllers/UsersController');
const adminAuthMiddleware = require('../app/middlewares/adminAuthMiddleware');
const authMiddleware = require('../app/middlewares/authMiddleware');

/* GET home page. */
router.get('/', getUsers);

router.post('/auth/signIn', emailSignIn);
router.post('/auth/signUp', emailSignup);
router.post('/auth/social_signin', socialSignIn)
router.post('/auth/social_signup', socialSignup)
router.post('/auth/refresh', refereshToken)
router.post('/auth/logout', logout)


module.exports = router;

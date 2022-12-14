const { Router } = require("express")
const { checkUserExist, getAuthDraftedPosts, getBlogger, getTopBloggers, getUserNotification, seenUserNotification, seenOneNotification, getUserAccount, updateProfileInfo, getBloggerPosts, getUserStepPosts, getUserPublishedPosts, getUserTrashedPosts, trashPost, restorePost, deletePost, savePost, removeSavePost, getSavedPosts, getTopCommenters, followUser, unFollowUser, getFollowings, getFollowers } = require("../app/controllers/UsersController")
const authMiddleware = require("../app/middlewares/authMiddleware")
var cacheService = require("express-api-cache");
const responseCache = require("../app/middlewares/cacheMiddleware");
var cache = cacheService.cache;

const router = Router()

router.get('/blogger/:userId', getBlogger)

router.get('/blogger/posts/:userId', getBloggerPosts)

router.get('/get_top_ranked/:limit', [cache('2 day'), responseCache], getTopBloggers)

router.get('/author_drafted_posts', authMiddleware, getAuthDraftedPosts)

router.post('/check_user_exists', checkUserExist)

router.get('/notifications',[authMiddleware], getUserNotification)

router.post('/notifications',[authMiddleware], seenUserNotification)

router.post('/seen_notification/:notificationId', [authMiddleware], seenOneNotification)

router.get('/user_account', [authMiddleware], getUserAccount)

router.post('/update_profile_info',[authMiddleware], updateProfileInfo)

router.get('/stepPosts/:userId', getUserStepPosts)

router.get('/published_posts', [authMiddleware], getUserPublishedPosts)

router.get('/trashed_posts', [authMiddleware], getUserTrashedPosts)

router.post('/trash_post', [authMiddleware], trashPost)
router.post('/restore_post', [authMiddleware], restorePost)
router.post('/delete_post', [authMiddleware], deletePost)

router.post('/save_post', [authMiddleware], savePost)
router.post('/remove_save_post', [authMiddleware], removeSavePost)
router.get('/saved_posts', [authMiddleware], getSavedPosts)

router.get('/top_commenters', getTopCommenters)

router.post('/follow', [authMiddleware], followUser)
router.post('/unfollow', [authMiddleware], unFollowUser)
router.get('/get_followings', [authMiddleware], getFollowings)
router.get('/get_followers', [authMiddleware], getFollowers)



router.get('/mu', async function(req, res){
    const post = await req.prisma.post.updateMany({
        data: {
            isDeclined: false,
        }
    })

    res.json({post})
})

module.exports = router
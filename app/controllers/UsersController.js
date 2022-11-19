const cookie = require('cookie');
const bcrypt = require('bcryptjs');
const Cloudinary = require('../Helpers/Cloudinary');
const consoleLog = require('../Helpers/consoleLog');

module.exports = {

    getUsers: async (req, res) => {

        const users = await req.prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                fullname: true,
                avatar: true
            }
        })

        return res.json({ users, securedUser: req.user, isAdmin: req.isAdmin })
    },

    getBlogger: async (req, res) => {

        const userId = req.params.userId

        try {
            const user = await req.prisma.user.findFirst({
                where: {
                    id: userId,
                    isActive: true,
                    isNew: false
                },
                select: {
                    id: true,
                    // userName: true,
                    // email: true,
                    fullName: true,
                    displayName: true,
                    bio: true,
                    avatar: true,
                    followers: true,
                    followings: true,
                    postComments: {
                        // take: 5,
                        orderBy: {
                            createdAt: 'desc'
                        },
                        where: {
                            isDeleted: false,
                            type: 'post'
                        },
                        include: {
                            author: true,
                            post: true
                        }
                    },

                    getComments: {
                        // take: 5,
                        where: {
                            isDeleted: false,
                            type: 'post'
                        },
                        orderBy: {
                            createdAt: 'desc'
                        },
                        include: {
                            author: true,
                            post: true
                        }
                    },
                    views: true,
                    postLikes: true,
                    birthDate: true,
                    createdAt: true,
                    birthPlace: true,
                    profession: true,
                    gender: true,
                    posts: {
                        where: {
                            status: 'published',
                            hasPublished: true,
                            isDeleted: false,
                            isDeclined: false,
                        },

                        orderBy: {
                            createdAt: 'desc'
                        },

                        include: {
                            categories: true,
                        }

                    }
                }
            })

            if (!user) return res.json({ ok: false })

            return res.json({ ok: true, user })

        } catch (error) {

            consoleLog('get blogger error', error.message)
            res.json({ ok: false })

        }

    },

    getBloggerPosts: async (req, res) => {

        const userId = req.params.userId

        try {

            const limit = parseInt(req.query.limit)
            const cursor = parseInt(req.query.cursor)

            console.log('cursor', req.query.cursor)

            const posts = await req.prisma.post.findMany({

                skip: cursor,
                take: limit,

                where: {
                    authorId: userId,
                    status: 'published',
                    hasPublished: true,
                    isDeleted: false,
                    isDeclined: false,
                },

                orderBy: {
                    publishedAt: 'desc'
                },

                include: {
                    author: {
                        include: {
                            followers: true,
                            posts: true
                        }
                    },
                    views: true,
                    comments: {
                        where: {
                            type: 'post'
                        }
                    },
                    likes: true,
                    categories: true
                }
            })


            return res.json({ ok: true, posts })

        } catch (error) {

            consoleLog('get blogger error', error.message)
            res.json({ ok: false })

        }

    },

    getTopBloggers: async (req, res) => {

        const limit = +req?.params?.limit

        try {
            const users = await req.prisma.user.findMany({
                where: {
                    isActive: true,
                    isNew: false,
                    posts: {
                        some: {
                            status: 'published',
                            hasPublished: true,
                            isDeleted: false,
                            isDeclined: false,
                        },
                    },
                },
                orderBy: {
                    rank: 'desc'
                },
                take: limit,
                select: {
                    id: true,
                    // userName: true,
                    // email: true,
                    fullName: true,
                    displayName: true,
                    bio: true,
                    avatar: true,
                    followers: true,
                    followings: true,
                    postComments: true,
                    getComments: {
                        where: {
                            isDeleted: false
                        }
                    },
                    views: true,
                    postLikes: true,
                    birthDate: true,
                    createdAt: true,
                    gender: true,
                    posts: {
                        where: {
                            status: 'published',
                            hasPublished: true,
                            isDeleted: false,
                            isDeclined: false,
                        },
                        orderBy: {
                            createdAt: 'desc'
                        }
                    }
                }
            })

            if (!users) return res.json({ ok: false })

            return res.json({ ok: true, users })

        } catch (error) {

            consoleLog('get top bloggers error', error.message)
            res.json({ ok: false })

        }

    },


    checkUserExist: async (req, res) => {
        const { by, value } = req.body

        // console.log('Req Body: ', req.body)

        const cookies = req.cookies
        const refreshToken = cookies?.rft

        console.log('req.cookies', refreshToken)

        try {

            var searchQuery = {}

            if (by == 'email') {
                searchQuery = {
                    email: value
                }

            } else if (by == 'username') {
                searchQuery = {
                    userName: value
                }

            } else if (by == 'id') {
                searchQuery = {
                    id: value
                }

            } else {
                searchQuery = undefined
            }

            const user = await req.prisma.user.findFirst({
                where: searchQuery
            })

            console.log('user find: ', user)

            if (user) return res.status(200).json({ ok: true, msg: 'সদস্য পাওয়া গেছে' })

            res.json({ ok: false, msg: 'কোন সদস্য পাওয়া যায়নি' })

        } catch (error) {
            consoleLog('TryCatch Error: ', error.message)
            return res.status(500).json({ ok: false, msg: error.message })
        }
    },

    updateUser: async (req, res) => {

    },

    deleteUser: async (req, res) => {
    },

    getAuthDraftedPosts: async (req, res) => {
        try {

            const posts = await req.prisma.post.findMany({
                where: {
                    authorId: req.user.id,
                    status: 'drafted',
                    isDeleted: false
                }
            })

            consoleLog('find author drafted posts', posts)

            return res.json({ ok: true, posts })

        } catch (error) {
            consoleLog('author drafted posts error', error.message)
        }
    },

    getUserNotification: async (req, res) => {
        try {

            const notifications = await req.prisma.notification.findMany({

                where: {
                    userId: req.user.id,
                    seen: false
                },

                orderBy: {
                    createdAt: 'desc'
                },

                include: {
                    sender: {
                        select: {
                            displayName: true,
                            avatar: true
                        }
                    },
                }
            })

            return res.json({ ok: true, notifications })

        } catch (error) {
            consoleLog('notification error', error.message)
        }
    },

    seenUserNotification: async (req, res) => {
        try {

            const notifications = await req.prisma.notification.updateMany({

                where: {
                    userId: req.user.id,
                    seen: false
                },

                data: {
                    seen: true,
                }

            })

            return res.json({ ok: true, notifications })

        } catch (error) {
            consoleLog('notification error', error.message)
        }
    },

    seenOneNotification: async (req, res) => {
        try {

            const notificationId = req.params.notificationId

            const not = await req.prisma.notification.updateMany({
                where: {
                    id: notificationId,
                    userId: req.user.id
                },

                data: {
                    seen: true
                }
            })

            console.log('not', not)

            return res.json({ ok: true })

        } catch (error) {
            consoleLog('seenNotification Error', error.message)
        }
    },

    getUserAccount: async (req, res) => {
        const userId = req.user.id

        try {
            const user = await req.prisma.user.findFirst({
                where: {
                    id: userId,
                    isActive: true,
                    isNew: false
                },
                select: {
                    id: true,
                    userName: true,
                    email: true,
                    fullName: true,
                    displayName: true,
                    bio: true,
                    avatar: true,
                    followers: true,
                    followings: true,
                    postComments: {
                        take: 5,
                        where: {
                            type: 'post'
                        },
                        orderBy: {
                            createdAt: 'desc'
                        },
                        include: {
                            author: true,
                            post: true
                        }
                    },
                    getComments: {
                        take: 5,
                        where: {
                            type: 'post',
                            isDeleted: false
                        },
                        orderBy: {
                            createdAt: 'desc'
                        },
                        include: {
                            author: true,
                            post: true
                        }
                    },
                    views: true,
                    postLikes: true,
                    birthDate: true,
                    birthPlace: true,
                    createdAt: true,
                    profession: true,
                    gender: true,
                    posts: {
                        where: {
                            status: 'published',
                            hasPublished: true,
                            isDeleted: false,
                            isDeclined: false,
                        },
                        orderBy: {
                            createdAt: 'desc'
                        },
                        include: {
                            categories: true,
                        }
                    }
                }
            })

            if (!user) return res.json({ ok: false })

            return res.json({ ok: true, user })

        } catch (error) {

            consoleLog('get blogger error', error.message)
            res.json({ ok: false })

        }
    },

    updateProfileInfo: async (req, res) => {

        try {

            const user = req.user

            if (!user?.id) return res.json({ ok: false })

            const imageUploadResult = req.body.image ? await Cloudinary.uploader.upload(req.body.image, {
                folder: 'profile_images'
            }) : null

            consoleLog('imageUploadResult ', imageUploadResult)

            const findUser = await req.prisma.user.findFirst({
                where: {
                    id: user.id
                }
            })

            if (!findUser) return res.json({ ok: false })

            const emailExists = await req.prisma.user.findFirst({
                where: {
                    id: {
                        not: user.id
                    },
                    email: req.body.email
                }
            })

            if (emailExists) return res.json({ ok: false, msg: 'ইমেইলটি অন্য একজন ব্যাবহার করছেন' })

            const updateUser = await req.prisma.user.update({
                where: {
                    id: user.id
                },

                data: {
                    avatar: imageUploadResult?.secure_url || findUser.avatar,
                    fullName: req.body.fullName,
                    displayName: req.body.displayName,
                    email: req.body.email,
                    gender: req.body.gender,
                    birthDate: new Date(req.body.birthDate).toISOString(),
                    birthPlace: req.body.birthPlace,
                    profession: req.body.profession,
                    bio: req.body.bio,
                }
            })

            consoleLog('updateUser ', updateUser)

            return res.status(200).send({ ok: true, user: updateUser })

        } catch (error) {

            consoleLog('Profile update error', error.message)

            return res.status(500).send({ ok: false, msg: error.message })

        }


    },

    getUserStepPosts: async (req, res) => {
        try {

            const userId = req.params.userId

            consoleLog('step posts user id', userId)

            const posts = await req.prisma.post.findMany({
                where: {
                    authorId: userId,
                    hasPublished: true,
                    postType: 'multiStep',
                    status: 'published',
                    hasPublished: true,
                    isDeleted: false,
                    isDeclined: false,
                    part: 1
                },
                include: {
                    childs: true
                }
            })

            return res.json({ ok: true, posts })

        } catch (error) {
            consoleLog('getUserStepPosts', error.message)
            return res.json({ ok: false, posts: [] })
        }
    },

    getUserPublishedPosts: async (req, res) => {
        try {

            const userId = req.user.id

            const posts = await req.prisma.post.findMany({
                where: {
                    authorId: userId,
                    status: 'published',
                    isDeleted: false,
                },
                orderBy: {
                    publishedAt: 'desc'
                },
                include: {
                    comments: true,
                    views: true,
                    likes: true
                }
            })


            res.json({ ok: true, posts: posts })

        } catch (error) {
            consoleLog('getUserPublishedPosts error', error)
            res.json({ ok: false, posts: [] })
        }
    },

    getUserTrashedPosts: async (req, res) => {
        try {

            const userId = req.user.id

            const posts = await req.prisma.post.findMany({
                where: {
                    authorId: userId,
                    isDeleted: true
                },
                orderBy: {
                    publishedAt: 'desc'
                }
            })


            res.json({ ok: true, posts: posts })

        } catch (error) {
            consoleLog('getUserTrashedPosts error', error)
            res.json({ ok: false, posts: [] })
        }
    },

    trashPost: async (req, res) => {
        try {

            const postId = req.body.id

            const post = await req.prisma.post.updateMany({
                where: {
                    id: postId,
                    authorId: req.user.id
                },

                data: {
                    isDeleted: true
                }
            })

            const comments = await req.prisma.comment.updateMany({
                where: {
                    postId: postId
                },

                data: {
                    isDeleted: true
                }
            })

            return res.json({ ok: true, post })

        } catch (error) {

            consoleLog('trashPost error', error)

            return res.json({ ok: false, error })

        }
    },

    restorePost: async (req, res) => {
        try {

            const postId = req.body.id

            const post = await req.prisma.post.updateMany({
                where: {
                    id: postId,
                    authorId: req.user.id
                },

                data: {
                    isDeleted: false
                }
            })

            const comments = await req.prisma.comment.updateMany({
                where: {
                    postId: postId
                },

                data: {
                    isDeleted: false
                }
            })

            return res.json({ ok: true, post })

        } catch (error) {

            consoleLog('trashPost error', error)

            return res.json({ ok: false, error })

        }
    },

    deletePost: async (req, res) => {
        try {

            const postId = req.body.id

            const post = await req.prisma.post.deleteMany({
                where: {
                    id: postId,
                    authorId: req.user.id
                }
            })

            const comments = await req.prisma.comment.deleteMany({
                where: {
                    postId: postId
                }
            })

            const likes = await req.prisma.like.deleteMany({
                where: {
                    postId: postId
                }
            })

            const views = await req.prisma.postView.deleteMany({
                where: {
                    postId: postId
                }
            })

            const notifications = await req.prisma.notification.deleteMany({
                where: {
                    postId: postId
                }
            })

            return res.json({ ok: true, post })

        } catch (error) {

            consoleLog('trashPost error', error)

            return res.json({ ok: false, error })

        }
    },

    savePost: async (req, res) => {
        try {
            const userId = req.user.id
            const id = req.body.id

            const savedPost = await req.prisma.savedPost.findFirst({
                where: {
                    userId: userId,
                    postId: id
                }
            })

            if (savedPost) return res.json({ ok: false })

            const save = await req.prisma.savedPost.create({
                data: {
                    userId: userId,
                    postId: id
                }
            })

            return res.json({ ok: true, save })

        } catch (error) {
            consoleLog('savePost error', error)
            return res.json({ ok: false })
        }
    },

    removeSavePost: async (req, res) => {
        try {
            const userId = req.user.id
            const id = req.body.id

            const save = await req.prisma.savedPost.deleteMany({
                where: {
                    userId: userId,
                    postId: id
                }
            })

            return res.json({ ok: true })

        } catch (error) {
            consoleLog('savePost error', error)
            return res.json({ ok: false })
        }
    },

    getSavedPosts: async (req, res) => {
        try {
            const userId = req.user.id

            const savedPost = await req.prisma.savedPost.findMany({
                where: {
                    userId: userId
                },
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    post: {
                        include: {
                            author: true,
                            comments: true,
                            likes: true
                        }
                    }
                }
            })

            return res.json({ ok: true, posts: savedPost })

        } catch (error) {
            consoleLog('savePost error', error)
            return res.json({ ok: false })
        }
    },

    getTopCommenters: async (req, res) => {
        try {

            const date = new Date()

            consoleLog('Date().getUTCDate()', date.getDate())

            const users = await req.prisma.user.findMany({
                where: {
                    isBanned: false,
                    isNew: false,
                    postComments: {
                        some: {
                            isDeleted: false,
                            type: 'post',
                            createdAt: {
                                gte: new Date(Date.now() - ((24 * 60 * 60 * 1000) * date.getDate())).toISOString()
                            },
                        },
                    }
                },

                take: 10,

                orderBy: {
                    postComments: {
                        _count: 'desc'
                    }
                },

                include: {
                    postComments: {
                        where: {
                            isDeleted: false,
                            type: 'post',
                            createdAt: {
                                gte: new Date(Date.now() - ((24 * 60 * 60 * 1000) * date.getDate())).toISOString()
                            },
                        }
                    }
                }
            })

            // consoleLog('top commenters', users.length)

            return res.json({ ok: true, users })

        } catch (error) {
            consoleLog('getTopCommenters error', error)
            res.json({ ok: false, users: [] })
        }
    },

    getFollowings: async (req, res) => {
        try {
            const userId = req.user.id

            const user = await req.prisma.user.findFirst({
                where: {
                    id: userId
                },

                select: {
                    followingIds: true
                }
            })

            return res.json({ ok: true, followings: user.followingIds })

        } catch (error) {
            consoleLog('get followings error', error)
            return res.json({ ok: false })
        }
    },

    getFollowers: async (req, res) => {
        try {
            const userId = req.user.id

            const user = await req.prisma.user.findFirst({
                where: {
                    userId: userId
                },

                select: {
                    followerIds: true
                }
            })

            return res.json({ ok: true, followers: user.followers })

        } catch (error) {
            consoleLog('get followers error', error)
            return res.json({ ok: false })
        }
    },

    followUser: async (req, res) => {

        try {

            const follow = await req.prisma.user.update({
                where: {
                    id: req.body.id,
                },

                data: {
                    followers: {
                        connect: {
                            id: req.user.id
                        }
                    },
                }
            })

            if (!follow) return res.json({ ok: false })

            // consoleLog('followUser', user)

            await req.prisma.user.update({
                where: {
                    id: req.body.id
                },
                data: {
                    rank: { increment: 2 }
                }
            })

            await req.prisma.user.update({
                where: {
                    id: req.user.id
                },
                data: {
                    rank: { increment: 1 }
                }
            })

            await req.prisma.notification.create({
                data: {
                    senderId: req.user.id,
                    userId: req.body.id,
                    text: `আপনাকে অনুসরন করেছেন`,
                    link: `/blogger/${req.user.id}`,
                    type: 'follow',
                    seen: false,
                }
            })

            return res.json({ ok: true, following: follow })


        } catch (error) {
            consoleLog('followUser', error)
            res.json({ ok: false })
        }
    },

    unFollowUser: async (req, res) => {

        try {

            const user = await req.prisma.user.update({
                where: {
                    id: req.body.id,
                },

                data: {
                    followers: {
                        disconnect: {
                            id: req.user.id
                        }
                    },
                }
            })

            if (!user) {
                console.log('follower already exists')
                return res.json({ ok: false })
            }

            await req.prisma.user.update({
                where: {
                    id: req.user.id
                },
                data: {
                    rank: { decrement: 1 }
                }
            })

            return res.json({ ok: true, following: user })

        } catch (error) {
            consoleLog('followUser', error)
            res.json({ ok: false })
        }
    },

}
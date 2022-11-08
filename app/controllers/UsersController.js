const cookie = require('cookie');
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
                        take: 5,
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
                    gender: true,
                    posts: {
                        where: {
                            status: 'published'
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
                    getComments: true,
                    views: true,
                    postLikes: true,
                    birthDate: true,
                    createdAt: true,
                    gender: true,
                    posts: {
                        where: {
                            status: 'published'
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
                    status: 'drafted'
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
    }

}
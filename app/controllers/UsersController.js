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
                    comments: true,
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

            if(!user) return res.json({ok: false})
    
            return res.json({ok: true, user })
            
        } catch (error) {

            consoleLog('get blogger error', error.message)
            res.json({ok: false})
            
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

            if(user) return res.status(200).json({ok:true, msg: 'সদস্য পাওয়া গেছে'})

            res.json({ok: false, msg: 'কোন সদস্য পাওয়া যায়নি'})

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

            return res.json({ok: true, posts})
            
        } catch (error) {
            consoleLog('author drafted posts error', error.message)
        }
    }

}
const consoleLog = require("../Helpers/consoleLog")

module.exports = {


    getAllCategory: async (req, res) => {

        try {
            const categories = await req.prisma.category.findMany({
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    posts: {
                        where: {
                            status: 'published',
                            hasPublished: true,
                            isDeleted: false,
                            isDeclined: false,
                        }
                    }
                }
            })
    
            // consoleLog('categories', categories)
    
            return res.json({ ok: true, categories })
            
        } catch (error) {

            consoleLog('getAllCategory error', error.message)
            
        }

    },

    getTopCategories: async (req, res) => {

        const categories = await req.prisma.category.findMany({
            take: 12,
            orderBy: {
                rank: 'desc'
            },
            select: {
                id: true,
                name: true,
                slug: true,
                posts: {
                    where: {
                        status: 'published',
                        hasPublished: true,
                        isDeleted: false,
                        isDeclined: false,
                    }
                }
            }
        })

        // consoleLog('categories', categories)

        return res.json({ ok: true, categories })
    },

    getOneCategory: async (req, res) => {

        const categoryId = req.params.categoryId

        try {
            // console.log('categoryId', categoryId)
            const category = await req.prisma.category.findFirst({

                where: {
                    id: categoryId
                },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    posts: {
                        where: {
                            status: 'published',
                            hasPublished: true,
                            isDeleted: false,
                            isDeclined: false,
                        }
                    }
                }
            })

            // consoleLog('categories', categories)

            return res.json({ ok: true, category })

        } catch (error) {
            consoleLog('get one category error', error.message)
            return res.json({ ok: false })

        }
    },

    createAllCategory: async (req, res) => {
        try {

            const categories = await req.prisma.category.createMany({
                data: [
                    { name: 'জীবন', slug: 'জীবন', isAdmin: false },

                ]
            })

            return res.json(categories)

        } catch (error) {
            consoleLog('Category Error: ', error.message)
        }
    },

    getPostsByCategory: async (req, res) => {

        const categoryId = req.params.id
        try {

            // const cursor = typeof req.params.cursor === undefined || req.params.cursor === NaN ? 0 : parseInt(req.params.cursor)
            const limit = parseInt(req.query.limit)
            const cursor = parseInt(req.query.cursor)

            // console.log('cursor', req.query.cursor)

            // where: {
            //     status: 'published',
            //     categoryIDs: {
            //         has: categoryId
            //     }
            // },

            const posts = await req.prisma.post.findMany({

                where: {
                    status: 'published',
                    hasPublished: true,
                    isDeleted: false,
                    isDeclined: false,
                    categoryIDs: {
                        has: categoryId
                    }
                },
                orderBy: {
                    publishedAt: 'desc'
                },

                skip: cursor,
                take: limit,

                include: {
                    author: {
                        include: {
                            followers: true,
                            posts: {
                                where: {
                                    status: 'published',
                                    hasPublished: true,
                                    isDeleted: false,
                                    isDeclined: false,
                                }
                            }
                        }
                    },
                    views: true,
                    comments: {
                        where: {
                            type: 'post',
                            isDeleted: false
                        }
                    },
                    likes: true,
                    categories: true
                }
            })

            return res.json({ ok: true, posts })

        } catch (error) {
            consoleLog('category posts error', error.message)
        }
    },

}
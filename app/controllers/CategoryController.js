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
            take: 10,
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
                    { name: 'কবিতা', slug: 'কবিতা', isAdmin: false },
                    { name: 'গল্প', slug: 'গল্প', isAdmin: false },
                    { name: 'উপন্যাস', slug: 'উপন্যাস', isAdmin: false },
                    { name: 'সাহিত্য', slug: 'সাহিত্য', isAdmin: false },
                    { name: 'সমসাময়িক', slug: 'সমসাময়িক', isAdmin: false },
                    { name: 'মুক্তিযুদ্ধ', slug: 'মুক্তিযুদ্ধ', isAdmin: false },
                    { name: 'লেখাপড়া', slug: 'লেখাপড়া', isAdmin: false },
                    { name: 'বিজ্ঞান-প্রযুক্তি', slug: 'বিজ্ঞান-প্রযুক্তি', isAdmin: false },
                    { name: 'ইতিহাস', slug: 'ইতিহাস', isAdmin: false },
                    { name: 'চিন্তাধারা', slug: 'চিন্তাধারা', isAdmin: false },
                    { name: 'সংস্কৃতি', slug: 'সংস্কৃতি', isAdmin: false },
                    { name: 'ছবি ব্লগ', slug: 'ছবি-ব্লগ', isAdmin: false },
                    { name: 'রাজনীতি', slug: 'রাজনীতি', isAdmin: false },
                    { name: 'ভ্রমণ কাহিনী', slug: 'ভ্রমণ-কাহিনী', isAdmin: false },
                    { name: 'দেশ-বিদেশ', slug: 'দেশ-বিদেশ', isAdmin: false },
                    { name: 'বই রিভিউ', slug: 'বই-রিভিউ', isAdmin: false },
                    { name: 'মুভি রিভিউ', slug: 'মুভি-রিভিউ', isAdmin: false },
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
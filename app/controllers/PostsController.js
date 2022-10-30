const Cloudinary = require("../Helpers/Cloudinary")
const consoleLog = require("../Helpers/consoleLog")

module.exports = {

    latestPost: async (req, res) => {

        try {

            const posts = await req.prisma.post.findMany({

                where: {
                    status: 'published'
                },

                orderBy: {
                    createdAt: 'desc'
                },

                include: {
                    author: true,
                    views: true,
                    comments: true,
                    likes: true
                }
            })

            // consoleLog('latest posts', posts)

            return res.json({ ok: true, posts })

        } catch (error) {
            consoleLog('latest posts error', error.message)
        }
    },

    getPostBySlug: async (req, res) => {

    },

    getPostById: async (req, res) => {

        const postId = req.params.postId
        const userId = req?.user?.id

        // consoleLog('auth userId', userId)
        try {

            const post = await req.prisma.post.findFirst({
                where: {
                    id: postId
                },

                include: {
                    author: {
                        include: {
                            posts: true,
                            followers: true
                        }
                    },
                    comments: true,
                    views: true,
                    likes: true
                }
            })

            // consoleLog('single post', post.views.length)

            if (post) return res.json({ ok: true, post })

            return res.json({ ok: false })

        } catch (error) {
            consoleLog('get editing post error', error.message)
            return res.json({ ok: false })
        }
    },

    createPost: async (req, res) => {
        try {

            if (!req?.user?.id) return res.json({ ok: false, msg: 'আপনি নিবন্ধত না!' })

            const post = await req.prisma.post.create({
                data: {
                    authorId: req?.user.id
                }
            })

            consoleLog('Post Created', post)

            return res.json({ ok: true, post })

        } catch (error) {
            consoleLog('post create error', error.message)
        }
    },

    getEditingPost: async (req, res) => {
        const postId = req.params.postId

        try {

            const post = await req.prisma.post.findFirst({
                where: {
                    id: postId
                }
            })

            consoleLog('editing post', post)

            return res.json({ ok: true, post })

        } catch (error) {
            consoleLog('get editing post error', error.message)
        }
    },

    updatePost: async (req, res) => {

        try {

            const slugify = (string) => {
                const newText = string
                    .toLowerCase()
                    .replace(/ /g, "-")
                // .replace(/[^\w-]+/g, "");

                return newText
            };

            const imageUploadResult = req.body.image ? await Cloudinary.uploader.upload(req.body.image, {
                folder: 'profile_images'
            }) : null

            if (!req.user?.id) return res.json({ ok: false, msg: 'আপনি অথেনটিক নন!' })

            const post = await req.prisma.post.update({
                where: {
                    id: req?.body?.id
                },
                data: {
                    title: req?.body?.title,
                    slug: slugify(req?.body?.title),
                    content: req?.body?.content,
                    image: imageUploadResult?.url,
                    postType: req?.body?.postType,
                    part: req?.body?.part,
                    categories: {
                        set: req?.body?.categories?.map(cat => {
                            return { id: cat }
                        })
                    },
                    status: req?.body?.status
                }
            })

            consoleLog('Post Updated', post)

            return res.json({ ok: true, post })

        } catch (error) {
            consoleLog('post update error', error.message)
        }

    },

    storePostTraffic: async (req, res) => {

        try {

            const ip = req.ip
            const postId = req.params.postId
            const authUserId = req?.user?.id

            // console.log('User Agent extracted', req.ua)


            const whereObj = authUserId ?
                {
                    userId: authUserId,
                }

                : {
                    ip: ip,
                    browser: req.ua.browser,
                    platform: req.ua.platform,
                    device: req.ua.device,
                    os: req.ua.os,
                }

            const existTraffic = await req.prisma.postView.findFirst({
                where: { postId: postId, ...whereObj }
            })

            if (existTraffic) {

                consoleLog('Created Post Trafic', 'Already exists')
                return res.json({ ok: false, msg: 'Already have same traffic' })
            }


            const createTraffic = await req.prisma.postView.create({
                data: {
                    postId: postId,
                    userId: authUserId,
                    ip: ip,
                    device: req.ua.device,
                    os: req.ua.os,
                    platform: req.ua.platform,
                    browser: req.ua.browser,
                }
            })

            consoleLog('Created Post Trafic', 'ok??')

            return res.json({ ok: true, traffic: createTraffic })

        } catch (error) {

            consoleLog('post traffic error', error.message)

        }




    },

    deletePost: async (req, res) => {

    },
}
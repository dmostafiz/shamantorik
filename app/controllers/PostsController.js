const Cloudinary = require("../Helpers/Cloudinary")
const consoleLog = require("../Helpers/consoleLog")
// const slugify = require('slugify')

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
                    author: true
                }
            })

            consoleLog('latest posts', posts)

            return res.json({ ok: true, posts })

        } catch (error) {
            consoleLog('latest posts error', error.message)
        }
    },

    getPostBySlug: async (req, res) => {

    },

    getPostById: async (req, res) => {
        const postId = req.params.postId

        try {

            const post = await req.prisma.post.findFirst({
                where: {
                    id: postId
                },

                include: {
                    author: true
                }
            })

            consoleLog('editing post', post)

            if(post) return res.json({ ok: true, post })

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

    deletePost: async (req, res) => {

    },
}
const consoleLog = require("../Helpers/consoleLog")

module.exports = {

    getAllPosts: async (req, res) => {

    },

    getPostBySlug: async (req, res) => {

    },

    getPostById: async (req, res) => {

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

            return res.json({ok: true, post})

        } catch (error) {
            consoleLog('get editing post error', error.message)
        }
    },

    updatePost: async (req, res) => {

        try {

            if (!req.user?.id) return res.json({ ok: false, msg: 'আপনি অথেনটিক নন!' })

            const post = await req.prisma.post.update({
                where: {
                    id: req?.body?.id
                },
                data: {
                    title: req?.body?.title,
                    content: req?.body?.content,
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
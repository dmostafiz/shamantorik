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

            if(!req?.user?.id) return res.json({ok: false, msg: 'আপনি নিবন্ধত না!'})

            const post = await req.prisma.post.create({
                data: {
                    authorId: req?.user.id
                }
            })

            consoleLog('Post Created', post)

            return res.json({ok: true, post})

        } catch (error) {
            consoleLog('post create error', error.message)
        }
    },

    updatePost: async (req, res) => {

    },

    deletePost: async (req, res) => {
        
    },
}
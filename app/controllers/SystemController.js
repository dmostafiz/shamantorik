const consoleLog = require("../Helpers/consoleLog")

module.exports = {
    search: async (req, res) => {

        try {

            const searchFor = req.params.searchFor

            const results = searchFor == 'blog'

                ? await req.prisma.post.findMany({
                    where: {
                        hasPublished: true,
                        status: 'published',
                        isDeleted: false,
                        isDeclined: false,
                        OR: [
                            {
                                title: {
                                    contains: req.params.q,
                                    mode: 'insensitive',
                                }
                            },
                            {
                                content: {
                                    contains: req.params.q,
                                    mode: 'insensitive',
                                }
                            }
                        ]
                    }
                })

                : searchFor == 'blogger'

                && await req.prisma.user.findMany({
                    where: {
                        isBanned: false,
                        isNew: false,
                        fullName: {
                            contains: req.params.q,
                            mode: 'insensitive',
                        }
                    },

                    select: {
                        id: true,
                        fullName: true,
                        displayName: true,
                        bio: true,
                        avatar: true,
                        posts: {
                            where: {
                                status: 'published',
                                hasPublished: true,
                                isDeleted: false,
                                isDeclined: false,
                            }
                        },
                        followers: true
                    }

                })


            consoleLog('Search Results', results)

            if (!results.length) return res.json({ ok: true, results: [] })

            return res.json({ ok: true, results })

        } catch (error) {

            consoleLog('Search Error', error.message)
            res.json({ ok: false })
        }



    }
}
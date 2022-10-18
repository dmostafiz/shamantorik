const cookie = require('cookie');

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
            console.log('TryCatch Error: ', error.message)
            return res.status(500).json({ ok: false, msg: error.message })
        }
    },

    updateUser: async (req, res) => {

    },

    deleteUser: async (req, res) => {

    },

}
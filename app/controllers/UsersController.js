const cookie = require('cookie');

module.exports = {

    getUsers: async (req, res) => {

        const users = await req.prisma.user.findMany()

        return res.setHeader('Set-Cookie', cookie.serialize(
            'refreshToken', 'thisisatestrefreshtoken', {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7,
            // domain: 'http://localhost:3000',
            path: '/'
        }))
            .send({ users , securedUser: req.user, isAdmin: req.isAdmin })
    },


    getUserByUsername: async (req, res) => {

    },


    getUserById: async (req, res) => {

    },

    updateUser: async (req, res) => {

    },

    deleteUser: async (req, res) => {
        
    },

}
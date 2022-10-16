const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = {

    emailSignIn: async (req, res) => {

        const { username, password } = req.body

        try {

            const user = await req.prisma.user.findOne({
                where: {
                    email: username
                }
            })

            if (!user) return res.status(401).send({ ok: false, msg: 'একাঊন্ট খুজে পাওয়া যায়নি' })

            const compare = await bcrypt.compare(password, user.password)

            if (!compare) return res.status(401).send({ ok: false, msg: 'পাসওয়ার্ড সঠিক নয়' })


            const accessToken = jwtSignAccessToken(user, '1d')
            const refreshToken = jwtSignRefreshToken(user, '1y')

            res.cookie('rft', refreshToken, {
                httpOnly: true, //accessible only by web server
                secure: false, // should be true in production for https only
                sameSite:false, // Cross-Site cookie
                maxAge: 7 * 24 * 60 * 60 * 1000
            })

            return res.status(200).send({ ok: true, accessToken, refreshToken })


        } catch (error) {
            return res.status(500).send({ ok: false, msg: error.message })
        }

    },

    socialSignIn: async (req, res) => {

        const { email } = req.body

        try {

            const user = await req.prisma.user.findOne({
                where: {
                    email: email
                }
            })

            if (!user) return res.status(401).send({ ok: false, msg: 'একাঊন্ট খুজে পাওয়া যায়নি' })

            const accessToken = jwtSignAccessToken(user, '1d')
            const refreshToken = jwtSignRefreshToken(user, '1y')

            return res.status(200).send({ ok: true, accessToken, refreshToken })

        } catch (error) {
            return res.status(500).send({ ok: false, msg: error.message })
        }

    },

    emailSignup: async (req, res) => {

        const { email } = req.body

        try {

            const user = await req.prisma.user.findUnique({
                where: {
                    email: email
                }
            })

            if (user) return res.status(401).send({ ok: false, msg: 'দুঃখিত! ইমেইলটি অন্য একটি একাউন্ট এর সাথে সংযুক্ত আছে' })


            const createUser = await req.prisma.user.create({
                data: {
                    email: email,
                    isNew: true
                }
            })

            console.log('Created user: ', createUser)

            const accessToken = jwtSignAccessToken(createUser, '1d')
            const refreshToken = jwtSignRefreshToken(createUser, '1y')

            // console.log('accessToken: ', accessToken)
            // console.log('refreshToken: ', refreshToken)

            res.cookie('rft', refreshToken, {
                domain: 'http://localhost:3000',
                path: '/',
                httpOnly: true, //accessible only by web server
                secure: false, // should be true in production for https only
                sameSite:false, // Cross-Site cookie
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })

            return res.status(200).send({ ok: true, accessToken })

        } catch (error) {
            console.log('TryCatch Error! ',  error.message)
            return res.status(500).send({ ok: false, msg: error.message })
        }

    },

    socialSignup: async (req, res) => {

        const { email, avatar } = req.body

        try {

            const user = await req.prisma.user.findOne({
                where: {
                    email: email
                }
            })

            if (user) return res.status(401).send({ ok: false, msg: 'দুঃখিত! ইমেইলটি অন্য একটি একাউন্ট এর সাথে সংযুক্ত আছে' })


            const createUser = req.prisma.user.create({
                data: {
                    email: email,
                    avatar: avatar,
                    isNew: true
                }
            })

            const accessToken = jwtSignAccessToken(user, '1d')
            const refreshToken = jwtSignRefreshToken(user, '1y')

            return res.status(200).send({ ok: true, accessToken, refreshToken })

        } catch (error) {
            return res.status(500).send({ ok: false, msg: error.message })
        }

    },

    refereshToken: async (req, res) => {
        const cookies = req.cookies

        if (!cookies?.rft) return res.status(401).json({ msg: 'Unauthorized!' })

        const refreshToken = cookies.rft

        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                if (err) return res.status(403).json({ msg: 'Forbidden!' })

                const user = await req.prisma.user.findUnique({
                    where: {
                        email: decoded.email
                    }
                })

                if (!user) return res.status(401).json({ msg: 'Unauthorized' })


                const accessToken = jwtSignAccessToken(
                    {
                        username: user.username,
                        email: user.email,
                        fullname: user.fullname,
                        avatar: user.avatar
                    },
                    '20s'
                )


                res.json({ accessToken })
            }
        )
    },

    logout: async (req, res) => {
        const cookies = req.cookies
        if (!cookies?.rft) return res.sendStatus(204) //No content
        res.clearCookie('rft', { httpOnly: true, sameSite: false, secure: false })

        res.json({ msg: 'Cookie cleared' })
    }

}


const jwtSignAccessToken = (data, exp = '1d') => {
    const token = jwt.sign(
        data,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: exp }
    );

    return token
}



const jwtSignRefreshToken = (data, exp = '1y') => {
    const token = jwt.sign(
        data,
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: exp }
    );

    return token
}
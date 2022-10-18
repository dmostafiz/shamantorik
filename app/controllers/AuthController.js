const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Cloudinary = require('../Helpers/Cloudinary');

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
                sameSite: false, // Cross-Site cookie
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

            if (user) return re.send({ ok: false, msg: 'দুঃখিত! ইমেইলটি অন্য একটি একাউন্ট এর সাথে সংযুক্ত আছে' })


            const createUser = await req.prisma.user.create({
                data: {
                    email: email,
                    isNew: true
                }
            })

            const profileUpdateToken = jwtSignUpdateToken(
                {
                    email: createUser.email,
                    redirectUrl: '/acc/initial/update_profile_information'
                }
            )

            return res.status(200).send({ ok: true, profileUpdateToken })

        } catch (error) {
            
            console.log('TryCatch Error! ', error.message)
            return res.status(500).send({ ok: false, msg: error.message })
        }

    },

    socialSignup: async (req, res) => {

        const { email, avatar } = req.body

        try {

            const user = await req.prisma.user.findFirst({
                where: {
                    email: email
                }
            })

            if (user) return res.status(401).send({ ok: false, msg: 'দুঃখিত! ইমেইলটি অন্য একটি একাউন্ট এর সাথে সংযুক্ত আছে' })


            const createUser = await req.prisma.user.create({
                data: {
                    email: email,
                    avatar: avatar,
                    isNew: true
                }
            })

            const profileUpdateToken = jwtSignUpdateToken(
                {
                    email: createUser.email,
                    avatar: createUser.avatar,
                    redirectUrl: '/acc/initial/update_profile_information'
                }
            )

            return res.status(200).send({ ok: true, profileUpdateToken })

        } catch (error) {
            console.log('Social Signup Error! ', error.message)
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

    updateInitialProfileInfo: async (req, res) => {

        try {

            
            const imageUploadResult = req.body.image ? await Cloudinary.uploader.upload(req.body.image, {
                folder: 'profile_images'
            }) : null

            console.log('imageUploadResult ', imageUploadResult)

            const updateUser = await req.prisma.user.update({
                where: {
                    email: req.decoded.email
                },

                data: {
                    avatar: imageUploadResult?.url,
                    fullName: req.body.fullName,
                    displayName: req.body.fullName,
                    gender: req.body.gender,
                    birthDate: new Date(req.body.birthDate).toISOString(),
                    bio: req.body.bio,
                }
            })

            console.log('updateUser ', updateUser)


            const profileUpdateToken = jwtSignUpdateToken(
                {
                    image: updateUser.image,
                    email: updateUser.email,
                    fullname: updateUser.fullName,
                    redirectUrl: '/acc/initial/update_username_password'
                }
            )

            return res.status(200).send({ ok: true, profileUpdateToken })

        } catch (error) {
            console.log('Profile update error ', error.message)
            return res.status(500).send({ ok: false, msg: error.message })

        }


    },

    updateInitialUsernamePassword: async (req, res) => {

        const password = bcrypt.hashSync(req.body.password, 12);

        const updateUser = await req.prisma.user.update({
           
            where: {
                email: req.decoded.email
            },

            data: {
                userName: req.body.userName,
                password: password,
                isNew: false,
                isActive: true,
                verifiedAt: new Date()
            }
        })

        console.log('Update User: ', updateUser)

        const accesToken = jwtSignAccessToken(
            {
                fullname: updateUser.fullName,
                userName: updateUser.userName,
                email: updateUser.email,
                avatar: updateUser.avatar
            },
            '1d'
        )


        return res.status(200).send({ ok: true, accesToken })

    },

    logout: async (req, res) => {
        const cookies = req.cookies
        if (!cookies?.rft) return res.sendStatus(204) //No content
        res.clearCookie('rft', { httpOnly: true, sameSite: false, secure: false })

        res.json({ msg: 'Cookie cleared' })
    },

    authorizeUpdate_token: async (req, res) => {

        const userEmail = req.decoded.email
        const redirectUrl = req.decoded.redirectUrl

        return res.json({ ok: true, redirectUrl: req.decoded.redirectUrl })
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

const jwtSignUpdateToken = (data) => {
    const token = jwt.sign(
        data,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1w' }
    );

    return token
}
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Cloudinary = require('../Helpers/Cloudinary');
const consoleLog = require('../Helpers/consoleLog');

module.exports = {

    emailSignIn: async (req, res) => {

        const { email, password } = req.body

        consoleLog('Login User ', email, password)

        try {

            const user = await req.prisma.user.findFirst({
                where: {
                    OR: [
                        { email: email },
                        { userName: email }
                    ]
                },
                select: {
                    id: true,
                    userName: true,
                    fullName: true,
                    displayName: true,
                    email:true,
                    avatar: true,
                    // isNew: true,
                    // isActive: true,
                    // role: true
                }
            })

            consoleLog('Login User', user)

            if (!user) return res.send({ ok: false, msg: 'একাঊন্ট খুজে পাওয়া যায়নি' })

            const compare = await bcrypt.compare(password, user.password)

            if (!compare) return res.send({ ok: false, msg: 'পাসওয়ার্ড সঠিক নয়' })

            if (user.isNew == true) {

                const profileUpdateToken = jwtSignUpdateToken(
                    {
                        email: user.email,
                        avatar: user.avatar,
                        redirectUrl: '/acc/initial/update_profile_information'
                    }
                )

                return res.send({ ok: true, type: 'update', profileUpdateToken })

            }

            const accessToken = jwtSignAccessToken(user, '1d')
            const refreshToken = jwtSignRefreshToken(user, '1y')

            setRefreshTokenCookie(res, refreshToken)

            return res.send({ ok: true, type: 'login', accessToken })


        } catch (error) {
            consoleLog('Login Try Catch Error', error.message)
            return res.status(500).send({ ok: false, msg: error.message })
        }

    },

    socialSignIn: async (req, res) => {

        const { email } = req.body

        try {

            const user = await req.prisma.user.findFirst({
                where: {
                    email: email
                }, 
                select: {
                    id: true,
                    userName: true,
                    fullName: true,
                    displayName: true,
                    email:true,
                    avatar: true,
                    // isNew: true,
                    // isActive: true,
                    // role: true
                }
            })

            if (!user) return res.send({ ok: false, msg: 'একাঊন্ট খুজে পাওয়া যায়নি' })

            if (user.isNew == true) {

                const profileUpdateToken = jwtSignUpdateToken(
                    {
                        email: user.email,
                        avatar: user.avatar,
                        redirectUrl: '/acc/initial/update_profile_information'
                    }
                )

                return res.send({ ok: true, type: 'update', profileUpdateToken })

            }

            const accessToken = jwtSignAccessToken(user, '1d')
            const refreshToken = jwtSignRefreshToken(user, '1y')

            setRefreshTokenCookie(res, refreshToken)


            // ('Response: cookie', res)

            return res.send({ ok: true, type: 'login', accessToken })

        } catch (error) {
            consoleLog('Social login error', error.message)
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
                    avatar: '',
                    redirectUrl: '/acc/initial/update_profile_information'
                }
            )

            return res.status(200).send({ ok: true, profileUpdateToken })

        } catch (error) {

            consoleLog('TryCatch Error! ', error.message)

            return res.status(500).send({ ok: false, msg: error.message })
        }

    },

    socialSignup: async (req, res) => {

        try {

            const { email, avatar, host } = req.body

            const hostName = host == 'google' ? 'গুগোল' : host == 'facebook' ? 'ফেসবুক' : ''

            const user = await req.prisma.user.findFirst({
                where: {
                    email: email
                }
            })

            if (user) return res.send({ ok: false, msg: `${hostName} একাউন্টটি আগে থেকে সংযুক্ত আছে।` })


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

            consoleLog('Social Signup Error! ', error.message)

            return res.status(500).send({ ok: false, msg: error.message })
        }
    },

    refereshToken: async (req, res) => {
        const cookies = req.cookies

        if (!cookies?.refreshToken) return res.status(401).json({ msg: 'Unauthorized!' })

        const refreshToken = cookies.refreshToken

        consoleLog('refreshToken', refreshToken)

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

            consoleLog('imageUploadResult ', imageUploadResult)

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

            consoleLog('updateUser ', updateUser)


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

            consoleLog('Profile update error', error.message)

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

        consoleLog('Update User: ', updateUser)

        const accessToken = jwtSignAccessToken(
            {
                id: updateUser.id,
                userName: updateUser.userName,
                email: updateUser.email,
                fullname: updateUser.fullName,
                avatar: updateUser.avatar
            },
            '1d'
        )

        const refreshToken = jwtSignRefreshToken(
            {
                id: updateUser.id,
                userName: updateUser.userName,
                email: updateUser.email,
                fullname: updateUser.fullName,
                avatar: updateUser.avatar
            }
        )

        setRefreshTokenCookie(res, refreshToken)

        return res.status(200).send({ ok: true, accessToken })

    },

    logout: async (req, res) => {

        try {
            if (req.user) {

                const cookies = req.cookies
                // if (!cookies?.refreshToken) return res.sendStatus(204) //No content
                res.clearCookie('refreshToken', { httpOnly: true, SameSite: 'none', secure: true })

                return res.json({ ok: true, msg: 'Cookie cleared' })

            }

        } catch (error) {
            consoleLog('Logout User error', error.message)
            res.json({ ok: false })
        }
    },

    authorizeUpdate_token: async (req, res) => {

        const email = req.decoded.email
        const redirectUrl = req.decoded.redirectUrl
        const avatar = req.decoded.avatar

        return res.json({ ok: true, email, avatar, redirectUrl })
    },

    getAuthorisedUser: async (req, res) => {

        try {
            const authUser = req?.user

            if (authUser) {

                const userData = await req.prisma.user.findUnique({

                    where: {
                        email: authUser.email
                    },

                    select: {
                        userName: true,
                        fullName: true,
                        displayName: true,
                        email: true,
                        avatar: true,
                        bio: true,
                        birthDate: true,
                        followers: true,
                        gender: true,
                        gender: true,
                        createdAt: true,
                        updatedAt: true
                    }
                })


                // consoleLog('get authorized user', userData)


                return res.json({ ok: true, user: userData })
            }

            return res.json({ ok: false, msg: "আপনি অথরাইজড ব্লগার না।" })

        } catch (error) {

            consoleLog('get authorized user error', error.message)

            return res.json({ ok: false, msg: "আপনি অথরাইজড ব্লগার না।" })

        }


    },

    check_post_author: async (req, res) => {

        const { postId } = req.body

        // consoleLog(' req.body',  req.body)
        // consoleLog('post id & author id', `${postId} & ${req?.user?.id}`)

        try {

            const post = await req.prisma.post.findFirst({
                where: {
                    id: postId,
                    authorId: req?.user?.id
                }
            })

            // consoleLog('check post author', post)


            if (!post) return res.json({ok: false})

            return res.json({ ok: true, post})

        } catch (error) {
            consoleLog('check post author error', error.message)
            return res.json({ ok: false })
        }
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



const setRefreshTokenCookie = (res, refreshToken) => {
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true, //accessible only by web server
        maxAge: 365 * 24 * 60 * 60 * 1000,
        secure: true,
        SameSite: 'none'
    })
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
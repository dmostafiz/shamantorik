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
                    publishedAt: 'desc'
                },

                include: {
                    author: {
                        include: {
                            followers: true,
                            posts: true
                        }
                    },
                    views: true,
                    comments: {
                        where: {
                            type: 'post'
                        }
                    },
                    likes: true,
                    categories: true
                }
            })

            // consoleLog('latest posts', posts)

            return res.json({ ok: true, posts })

        } catch (error) {
            consoleLog('latest posts error', error.message)
        }
    },

    getTopPost: async (req, res) => {

        try {

            const limit = +req?.params?.limit

            const posts = await req.prisma.post.findMany({

                where: {
                    status: 'published'
                },

                orderBy: {
                    rank: 'desc'
                },

                take: limit,

                include: {
                    author: {
                        include: {
                            followers: true,
                            posts: true
                        }
                    },
                    views: true,
                    comments: {
                        where: {
                            type: 'post'
                        }
                    },
                    likes: true,
                    categories: true
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

            if (!req?.user?.id) return res.json({ ok: false })

            const slugify = (string) => {
                const newText = string
                    .replace(/ /g, "-")
                // .replace(/[^\w-]+/g, "");

                return newText
            };

            const imageUploadResult = req.body.image ? await Cloudinary.uploader.upload(req.body.image, {
                folder: 'profile_images'
            }) : null

            if (!req.user?.id) return res.json({ ok: false, msg: 'আপনি অথেনটিক নন!' })

            // const checkPost = await req.prisma.post.findFirst({
            //     where: {
            //         id: req?.body?.id
            //     }
            // })

            // if(checkPost){

            // }

            const checkPost = await req.prisma.post.findFirst({
                where: {
                    id: req?.body?.id
                }
            })

            const updatePublished = (checkPost.hasPublished == false && req?.body?.status == 'published')
                ? {
                    hasPublished: true,
                    publishedAt: new Date()
                }

                : undefined



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
                    ...updatePublished,
                    status: req?.body?.status,
                }
            })

            if ((checkPost.hasPublished == false && req?.body?.status == 'published' && post)) {
                await req.prisma.user.update({
                    where: {
                        id: req?.user.id
                    },
                    data: {
                        rank: { increment: 5 }
                    }
                })

                const imageRank = post.image ? 1 : 0
                const titleRank = post.title ? 1 : 0

                const wordSpilit = post?.content?.split(" ")
                const wordCountRant = wordSpilit?.length > 49 ? 1 : wordSpilit?.length > 100 ? 2 : wordSpilit?.length > 250 ? 3 : wordSpilit?.length > 500 ? 4 : wordSpilit?.length > 1000 ? 5 : 0

                const newRank = imageRank + titleRank + wordCountRant

                await req.prisma.post.update({
                    where: {
                        id: req?.body?.id
                    },
                    data: {
                        rank: {
                            increment: newRank
                        }
                    }
                })
            }

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

    postLike: async (req, res) => {

        try {

            const userId = req?.user?.id

            if (!userId) return res.json({ ok: false })

            const existingLike = await req.prisma.like.findFirst({
                where: {
                    authorId: userId,
                    postId: req.params?.postId
                }
            })

            const post = await req.prisma.post.findFirst({
                where: {
                    id: req.params?.postId
                }
            })

            if (existingLike) {

                const deleteLike = await req.prisma.like.delete({
                    where: {
                        id: existingLike.id
                    }
                })

                if (deleteLike && post.authorId != req?.user?.id) {
                    // decrement user rank  ( who give like )
                    await req.prisma.user.update({
                        where: {
                            id: req?.user?.id
                        },
                        data: {
                            rank: { decrement: 1 }
                        }
                    })

                    // decrement post rank
                    const decrementPostRank = await req.prisma.post.update({
                        where: {
                            id: deleteLike.postId
                        },
                        data: {
                            rank: { decrement: 2 }
                        }
                    })

                    if (decrementPostRank) {
                        // increment user rank ( who get like )
                        await req.prisma.user.update({
                            where: {
                                id: decrementPostRank.authorId
                            },
                            data: {
                                rank: { decrement: 1 }
                            }
                        })
                    }
                }

                return res.json({ ok: true, likeStatus: 'unlike' })
            }


            const createLike = await req.prisma.like.create({
                data: {
                    authorId: userId,
                    postId: req.params?.postId
                }
            })

            if (createLike && post.authorId != req?.user?.id) {

                // increment user rank  ( who give like )
                await req.prisma.user.update({
                    where: {
                        id: createLike.authorId
                    },
                    data: {
                        rank: { increment: 1 }
                    }
                })

                // increment post rhank
                const incrementPostRank = await req.prisma.post.update({
                    where: {
                        id: createLike.postId
                    },
                    data: {
                        rank: { increment: 2 }
                    }
                })

                if (incrementPostRank) {
                    // increment user rank ( who get like )
                    await req.prisma.user.update({
                        where: {
                            id: incrementPostRank.authorId
                        },
                        data: {
                            rank: { increment: 1 }
                        }
                    })
                }

                if (createLike.authorId != incrementPostRank.authorId) {
                    await req.prisma.notification.create({
                        data: {
                            senderId: createLike.authorId,
                            userId: incrementPostRank.authorId,
                            postId: incrementPostRank.id,
                            likeId: createLike.id,
                            text: 'আপনার পোস্ট এ লাইক দিয়েছেন',
                            link: `/blog/${incrementPostRank.id}`,
                            type: 'like',
                            seen: false,
                        }
                    })
                }

            }

            return res.json({ ok: true, likeStatus: 'like' })

        } catch (error) {
            consoleLog('Post Like Error', error.message)
        }
    },

    postImageUploader: async (req, res) => {
        try {

            // consoleLog('Req image', req.body)

            const imageUploadResult = req.body.image ? await Cloudinary.uploader.upload(req.body.image, {
                folder: 'post_image'
            }) : null

            consoleLog('imageUploadResult', imageUploadResult)

            res.json({ location: imageUploadResult?.url })

        } catch (error) {
            consoleLog('image upload error!', error.message)
        }
    },

    storeComment: async (req, res) => {
        try {

            const {
                content,
                replyTo,
                id
            } = req.body

            const userId = req.user?.id

            if (!userId) return res.json({ ok: false, msg: 'দুঃখিত! আপনি অথরাইজড সদস্য নন।' })

            if (replyTo == 'post') {

                const post = await req.prisma.post.findFirst({
                    where: {
                        id: id
                    }
                })

                if (!post) return res.json({ ok: false, msg: 'দুঃখিত! পোস্টটি খুজে পাওয়া যায়নি।' })

                const userCommentCount = await req.prisma.comment.findMany({
                    where: {
                        authorId: userId,
                        userId: post.authorId,
                        postId: id,
                        type: 'post'
                    }
                })

                const comment = await req.prisma.comment.create({
                    data: {
                        authorId: userId,
                        userId: post.authorId,
                        postId: id,
                        type: 'post',
                        content: content
                    }
                })


                if (comment && !userCommentCount.length && post.authorId != req?.user?.id) {

                    // increment user rank  ( who give comment )
                    await req.prisma.user.update({
                        where: {
                            id: comment.authorId
                        },
                        data: {
                            rank: { increment: 2 }
                        }
                    })

                    // increment post rank
                    const incrementPostRank = await req.prisma.post.update({
                        where: {
                            id: comment.postId
                        },
                        data: {
                            rank: { increment: 1 }
                        }
                    })

                    if (incrementPostRank) {

                        // increment user rank  ( who get comment )
                        await req.prisma.user.update({
                            where: {
                                id: incrementPostRank.authorId
                            },
                            data: {
                                rank: { increment: 1 }
                            }
                        })
                    }


                }

                if (!comment) res.json({ ok: false, msg: 'দুঃখিত! আবার চেষ্টা করুন।' })

                return res.json({ ok: true, comment })

            }

            else if (replyTo == 'reply') {

                const reply = await req.prisma.comment.findFirst({
                    where: {
                        id: id
                    },
                    include: {
                        post: {
                            select: {
                                authorId: true
                            }
                        }
                    }
                })

                if (!reply) return res.json({ ok: false, msg: 'দুঃখিত! মন্তব্যটি খুজে পাওয়া যায়নি।' })

                const comment = await req.prisma.comment.create({
                    data: {
                        authorId: userId,
                        userId: reply.post.authorId,
                        postId: reply.postId,
                        parentId: reply.id,
                        type: 'reply',
                        content: content
                    }
                })

                if (comment && comment.authorId != reply.post.authorId) {

                    // increment post
                    await req.prisma.post.update({
                        where: {
                            id: comment.postId
                        },
                        data: {
                            rank: { increment: 1 }
                        }
                    })

                }

                if (!comment) res.json({ ok: false, msg: 'দুঃখিত! আবার চেষ্টা করুন।' })

                return res.json({ ok: true, comment })

            }

        } catch (error) {
            consoleLog('commenting error', error.message)
            res.json({ ok: false, msg: 'দুঃখিত! আবার চেষ্টা করুন।' })
        }
    },

    deleteComment: async (req, res) => {

    },

    getPostComments: async (req, res) => {

        const postId = req.params.postId

        try {

            const comments = await req.prisma.comment.findMany({
                where: {
                    postId: postId,
                    type: 'post'
                },

                orderBy: {
                    createdAt: 'desc'
                },

                include: {

                    childs: {

                        orderBy: {
                            createdAt: 'desc'
                        },

                        include: {

                            author: {

                                select: {
                                    id: true,
                                    displayName: true,
                                    avatar: true,
                                    createdAt: true,
                                    updatedAt: true

                                }
                            },

                            childs: {

                                orderBy: {
                                    createdAt: 'desc'
                                },

                                include: {

                                    author: {

                                        select: {
                                            id: true,
                                            displayName: true,
                                            avatar: true,
                                            createdAt: true,
                                            updatedAt: true

                                        }
                                    }
                                }
                            },
                        }
                    },

                    author: {
                        select: {
                            id: true,
                            displayName: true,
                            avatar: true,
                            createdAt: true,
                            updatedAt: true
                        }
                    }
                }
            })

            // consoleLog('comments', comments)

            return res.json({ ok: true, comments })

        } catch (error) {
            consoleLog('get editing post error', error.message)
        }
    },

    getLatestComments: async (req, res) => {

        const limit = +req.params.limit

        try {

            const comments = await req.prisma.comment.findMany({
                where: {
                    type: 'post'
                },

                take: limit,

                orderBy: {
                    createdAt: 'desc'
                },

                include: {

                    post: true,


                    author: {
                        select: {
                            id: true,
                            displayName: true,
                            avatar: true,
                            posts: true,
                            followers: true,
                            createdAt: true,
                            updatedAt: true
                        },
                    }
                }
            })

            // consoleLog('comments', comments)

            return res.json({ ok: true, comments })

        } catch (error) {
            consoleLog('get editing post error', error.message)
        }
    },


}
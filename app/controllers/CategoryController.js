const consoleLog = require("../Helpers/consoleLog")

module.exports = {


    getAllCategory: async (req, res) => {

        const categories = await req.prisma.category.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                posts: true
            }
        })

        // consoleLog('categories', categories)

        return res.json({ok: true, categories})
    },

    createAllCategory: async (req, res) => {
        try {

            const categories = await req.prisma.category.createMany({
                data: [
                    { name: 'কবিতা', slug: 'কবিতা', isAdmin: false },
                    { name: 'গল্প', slug: 'গল্প', isAdmin: false },
                    { name: 'উপন্যাস', slug: 'উপন্যাস', isAdmin: false },
                    { name: 'সাহিত্য', slug: 'সাহিত্য', isAdmin: false },
                    { name: 'সমসাময়িক', slug: 'সমসাময়িক', isAdmin: false },
                    { name: 'মুক্তিযুদ্ধ', slug: 'মুক্তিযুদ্ধ', isAdmin: false },
                    { name: 'লেখাপড়া', slug: 'লেখাপড়া', isAdmin: false },
                    { name: 'বিজ্ঞান-প্রযুক্তি', slug: 'বিজ্ঞান-প্রযুক্তি', isAdmin: false },
                    { name: 'ইতিহাস', slug: 'ইতিহাস', isAdmin: false },
                    { name: 'বই রিভিউ', slug: 'বই-রিভিউ', isAdmin: false },
                    { name: 'চিন্তাধারা', slug: 'চিন্তাধারা', isAdmin: false },
                    { name: 'সংস্কৃতি', slug: 'সংস্কৃতি', isAdmin: false },
                    { name: 'ছবি ব্লগ', slug: 'ছবি-ব্লগ', isAdmin: false },
                    { name: 'রাজনীতি', slug: 'রাজনীতি', isAdmin: false },
                    { name: 'ভ্রমণ কাহিনী', slug: 'ভ্রমণ-কাহিনী', isAdmin: false },
                    { name: 'দেশ-বিদেশ', slug: 'দেশ-বিদেশ', isAdmin: false },
                    { name: 'বই রিভিউ', slug: 'বই-রিভিউ', isAdmin: false },
                    { name: 'মুভি রিভিউ', slug: 'মুভি-রিভিউ', isAdmin: false },
                ]
            })

            return res.json(categories)

        } catch (error) {
            consoleLog('Category Error: ', error.message)
        }
    }


}
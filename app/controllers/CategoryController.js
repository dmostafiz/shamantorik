module.exports = {

    createAllCategory: async (req, res) => {
        try {

            const categories = await req.prisma.category.createMany({
                data: [
                    {

                    }
                ],

                skipDuplicates: true,
            })

            return res.json(categories)

        } catch (error) {
            consoleLog('Category Error: ', error.message)
        }
    }


}
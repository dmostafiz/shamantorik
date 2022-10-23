
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const categoryRoutes = require('./categoryRoutes');
const postRoutes = require('./postRoutes');



module.exports = (app) => {

    app.use('/api/auth', authRoutes);
    app.use('/api/user', userRoutes);
    app.use('/api/category', categoryRoutes);
    app.use('/api/post', postRoutes);

};

const mongoose = require('mongoose');
require('dotenv').config();  // Ensure this is at the top
const mongoURI = process.env.ATLAS_URI;
const connectToMongo = () => {
    mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB Atlas successfully'))
    .catch(err => console.error('Could not connect to MongoDB:', err));
};
module.exports = connectToMongo;
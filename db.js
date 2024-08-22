const mongoose = require('mongoose');
require('dotenv').config();  // Ensure this is at the top

const connectToMongo = () => {
    mongoose.connect(process.env.ATLAS_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Connected to MongoDB successfully'))
    .catch(err => console.error('Could not connect to MongoDB:', err));
};

module.exports = connectToMongo;
const mongoose = require('mongoose');
// const mongoURI = 'mongodb://localhost:27017/mynotebook';
require('dotenv').config();
const connectToMongo = ()=>{
    mongoose.connect(process.env.ATLAS_URI)
    .then(()=> console.log('Connected to mongodb successfully'))
    .catch(err => console.error('Could not connecct to mongodb:',err));
}

module.exports = connectToMongo;
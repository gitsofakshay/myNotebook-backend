const mongoose = require('mongoose');
// const mongoURI = ' mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.2.10';
const mongoURI = 'mongodb://localhost:27017/mynotebook';
const connectToMongo = ()=>{
    mongoose.connect(mongoURI,)
    .then(()=> console.log('Connected to mongodb successfully'))
    .catch(err => console.error('Could not connecct to mongodb:',err));
}

module.exports = connectToMongo;
const mongoose = require('mongoose');

const connectDatabase =async()=>{
    try{
        mongodbUrl = process?.env?.DB_URI ?? "mongodb://localhost:27017/Waverr"; // redirecting to localhost for testing
        const data = await mongoose.connect(mongodbUrl);
        console.log(`MongoDB connected`);

    }catch(err){
        console.log('MongoDB Connection error : ',err);
        process.exit(1);
    }
}

module.exports = connectDatabase;
const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 180000
        });
        console.log(`Mongo DB connected successfully ${mongoose.connection.host}`)
    } catch (error) {
        console.log(`Mongo Db Server Problem ${error}`)
    }
}

module.exports = connectDB;
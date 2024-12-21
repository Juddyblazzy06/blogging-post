const mongoose = require('mongoose');
const connectDb = async () => {
     try {
          mongoose.set('debug', true)
          mongoose.set('strictQuery', false);
          const conn = await mongoose.connect(process.env.MONGODB_URI);
          console.log(`MongoDB Connected: ${conn.connection.host}`)
          
     } catch (error) {
       console.log(`Error: ${error.message}`);   
     }
};


module.exports = connectDb;
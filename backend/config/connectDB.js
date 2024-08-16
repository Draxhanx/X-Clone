import mongoose from "mongoose";


export const connectDB = async ()=>{
   try {
   await mongoose.connect('mongodb://localhost:27017/x-mongodb')
   console.log("Database connected");

    
} catch (error) {
    console.error(error + " : Database is not connected");
    
} 
}

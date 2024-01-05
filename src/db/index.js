import mongoose, { mongo } from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDb=async()=>{
    try {
        const dbInstance=await mongoose.connect("mongodb://localhost/codeial_development");
        // const dbInstance=await mongoose.connect(`${process.env.MONGODB_URL}/$`);
        console.log(dbInstance)
        console.log(`mongodb connected ${dbInstance.connection.host}`)
    } catch (error) {
        console.log("Mongo db connection error",error);
        process.exit(1); 
    }
}

export default connectDb;
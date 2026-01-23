import mongoose from "mongoose";
import { DB_Name } from "../constants.js";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () =>{
    try {

       const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_Name}`);
      //  console.log(connectionInstance);
       console.log(`DB connected !! DB Host : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("DB connection error is : " , error);
      process.exit(1);  
    }
}
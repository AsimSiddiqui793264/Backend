import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./db/index.js";
import { app } from "./app.js";

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 5000, () => {
            console.log(`Server is runing on http://localhost:${process.env.PORT}`);
        });

        app.on("error", (err) => {
            console.error("Error connecting to MongoDB:", err);
        });

    })
    .catch((err) => {
        console.log("DB connection failed : ", err);
    })










// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import { DB_Name } from "./constants.js";
// import express from "express";

// dotenv.config();

// const app = express();

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URL}/${DB_Name}`);

//     app.on("error", (err) => {
//       console.error("Error connecting to MongoDB:", err);
//     });

//     app.listen(process.env.PORT, () => {
//       console.log(`Server is running on port ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.error("Error connecting to MongoDB:", error);
//   }
// })();
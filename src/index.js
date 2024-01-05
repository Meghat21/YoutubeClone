// require('dotenv').config({path:'./env'})
// require('dotenv').config()
// console.log(process.env)
// import dotenv from "dotenv";
import {} from 'dotenv/config'
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDb from "./db/index.js";
import { app } from "./app.js";
// connectDb

// dotenv.config({
//     path:'./env'
// })


connectDb()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("Mongod db connect fail !",err)
})
// ;(async()=>{
//     try {
//         mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//         app.on('error',(error)=>{
//             console.log(error)
//             throw error
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log(`App listening on port ${PORT}`)
//         })
//     } catch (error) {
//         console.log("error found",error);
//         throw error
//     }
// })() //IIFE
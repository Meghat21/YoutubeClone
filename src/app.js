import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import userRouter from "./routes/user.route.js";

const app=express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({
    limit:"16kb"
}))

app.use(bodyParser.urlencoded({
    extended:true,
    limit:"16kb"
}));

app.use(express.static("public"))

//routes declaration
app.use("/api/v1/users",userRouter)

export {app}


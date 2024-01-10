import {User}  from "../models/user.model.js";
import { APIError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT=asyncHandler(async(req,res,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new APIError(401,"Unauthorized request")
        }
    
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new APIError(401,"Unauthorized user")
        }
    
        req.user=user
        next();
    } catch (error) {
        throw new APIError(401,"no token");
    }
})
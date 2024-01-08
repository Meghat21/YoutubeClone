import {asyncHandler} from '../utils/asynchandler.js';
import {APIResponse} from "../utils/ApiResponse.js"
import {APIError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const registerUser=asyncHandler(async(req,res)=>{
    //get user detail from frontend
    //validate user details
    //check if user already exist
    //check for images - check for avatar
    //upload pictures in cloudinary
    //create object user to save user
    //remove password refreshToken
    //check for user creation
    //return res

    const {email,username,fullname,password}=req.body;

    // console.log(email);
    //check validation
    if([fullname,email,username,password].some((field)=>field?.trim()==="")){
        throw new APIError(400,"all fields are required")
    }

    const existedUser=User.findOne({
        $or:[{email}
            ,
        {username}]
    })

    //checking if user exist
    if(existedUser){
        throw new APIError(409,"User already exist")
    }

    //check for images
    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImage=req.files?.coverImage[0].path;

    if(!avatarLocalPath){
        throw new APIError(400,"Error not found")
    }




})


export {registerUser}
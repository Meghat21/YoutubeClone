import {asyncHandler} from '../utils/asynchandler.js';
import {APIResponse} from "../utils/ApiResponse.js"
import {APIError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const generateAccessAndRefreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}
    } catch (error) {
        throw new APIError(500,"something went wrong while generating access and refresh token")
    }
}

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

    const existedUser=await User.findOne({
        $or:[{email},{username}]
    })

    //checking if user exist
    if(existedUser){
        throw new APIError(409,"User already exist")
    }

    console.log(req.files)
    //check for images
    const avatarLocalPath=req.files?.avatar[0]?.path;
    // const coverImageLocalPath=req.files?.coverImage[0].path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath=req.files?.coverImage[0].path;
    }


    if(!avatarLocalPath){
        throw new APIError(400,"Error not found")
    }

    //upload on cloudinary
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new APIError(400,"Error not found")
    }
    const user=await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url,
        email,
        username:username,
        password
    })

    const createdUser=await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new APIError(500,"Something went wrong while creating User")
    }

    return res.status(201).json(
        new APIResponse(200,createdUser,"User registered successfully")
    )
})

const loginUser=asyncHandler(async(req,res)=>{
    //req body data
    //check if username or email exist
    //find user
    //check password
    //access and refresh token generate
    //send cookie

    // const {email,username,password}=req.body;

    // if(!username || !email){
    //     throw new APIError(400,"username or email is required");
    // }

    // const existedUser=await User.findOne({
    //     $or:[{email},{username}]
    // })

    // if(!existedUser){
    //     throw new APIError(404,"user not exist")
    // }

    // const ispasswordvalid=await existedUser.isPasswordCorrect(password);
    // if(!ispasswordvalid){
    //     throw new APIError(404,"password incorrect")
    // }

    // generateAccessAndRefreshToken(existedUser._id)

    //req body=>data
    //username or email
    //find the user
    //password check
    //access and refresh token
    //send cookie

    const {email,password,username}= req.body;

    if(!(username || email)){
        throw new APIError(404,"User doesnt exist");
    }

    const existedUser=await User.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(!existedUser){
        throw new APIError(404,"User doesnt exist");
    }

    const isPasswordValid = await existedUser.isPasswordCorrect(password);


    if(!isPasswordValid){
        throw new APIError(404,"Password is incorrect");
    }


    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(existedUser._id)


    const loggedInUser=await User.findById(existedUser._id).select("-password -refreshToken")


    const option={
        httpOnly:true,
        secure:true
    } //only server can modify


    return res.status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
        new APIResponse(200,{user:loggedInUser,accessToken,refreshToken},"User logged In Successfully")
    );



})

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,{
            $set:{
                refreshToken:1
            }
        },{
            new:true
        }
    )

    const option={
        httpOnly:true,
        secure:true
    }

    return res.status(200).clearCookie("accessToken",option).clearCookie("refreshToken",option).json(
        new APIResponse(200,{},"User logged out")
    )
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    //acces it from cookies
    const incomingRequestToken=req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRequestToken){
        throw new APIError(401,"Unauthorized access");
    }

    try {
        const decodedToken=jwt.verify(incomingRequestToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user=await User.findById(decodedToken?._id)
    
        if(user){
            throw new APIError(401,"Invalid refresh token");
        }
    
        if(incomingRequestToken !== user?.refreshToken){
            throw new APIError(401,"Used refresh token");
    
        }
        const options={
            httpOnly:true,
            secure:true
        }
        const{accessToken,newrefreshToken}=await generateAccessAndRefreshToken(user._id)
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new APIResponse(200,
                {
                    accessToken,refreshToken:newrefreshToken
                },
                "new refresh token")
        )
    } catch (error) {
        throw new APIError(400,"Invalid token ")
    }
})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body;

    const user=await User.findById(req.user?._id);

    const isPasswordValid=await user.isPasswordCorrect(oldPassword);

    if(!isPasswordValid){
        throw new APIError(400,"Wrong password");
    }

    user.password=newPassword

    await user.save({validateBeforeSave:false})

    return res.status(200)
    .json(
        new APIResponse(200,
            {},"Password changed")
    )
})


const updateAccountDetails=asyncHandler(async(req,res)=>{
    const{fullname,email}=req.body

    if(!fullname || !email){
        throw new APIError(400,"All fields are required")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,{
            $set:{
                fullname,
                email:email
            }
        },{
            new:true
        }
    ).select("-password")

    res.status(200)
    .json(
        new APIResponse(200,user,"Account detail updated")
    )
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path

    if(!avatarLocalPath){
        throw new APIError(400,"Avatar file is misisng")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new APIError(400,"Error while uploading on avatar")
    }

    const user=await User.findById(req.user?._id,{
        $set:{
            avatar:avatar.url
        }
    },{new:true}).select("-password")

    return res
    .status(200)
    .json(
        new APIResponse(200,user,"Update Avatar Image")
    )
})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path

    if(!coverImageLocalPath){
        throw new APIError(400,"cover image missing")
    }
    
    const coverImage=await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url){
        throw new APIError(500,"Server Error","Failed to save Cover Image");
    }

    const user=await User.findById(req.user?._id,{
        $set:{
            coverImage:coverImage.url
        }
    },{new:true}).select("-password")

    
    return res
    .status(200)
    .json(
        new APIResponse(200,user,"Update Avatar Image")
    )
})

// const getUserchannelProfile=asyncHandler(async(req,res)=>{
//     const {username}=req.params

//     if(!username?.trim()){
//         throw new APIError(400,"Username is missing")
//     }

//     const channel=await User.aggregate([
//         {
//             $match:{
//                 username:username
//             }
//         },{
//             $lookup:{
//                 from:"Subscriptions",
//                 localField:"_id",
//                 foreignField:"channel",
//                 as:"suscribers"
//             }
//         },
//         {
//             $lookup:{
//                 from:"Subscriptions",
//                 localField:"_id",
//                 foreignField:"suscriber",
//                 as:"suscribeTo"
//             }
//         },{
//             $addFields:{
//                 suscriberCOunt:{
//                     $size:"$suscribers"
//                 },
//                 channelSuscribeToCount:{
//                     $size:"suscribeTo"
//                 },
//                 isSubscribed:{
//                     $cond:{
//                         if:{$in:[req.user?._id,"$suscribers.suscriber"]},
//                         then:true,
//                         else:false
//                     }
//                 }
//             }
//         },{
//             $project:{
//                 fullname:1,
//                 username:1,
//                 suscriberCOunt:1,
//                 channelSuscribeToCount:1,
//                 isSubscribed:1,
//                 avatar:1,
//                 coverImage:1,
//                 email:1
//             }
//         }
//     ])

//     if(!channel?.length){
//         throw new APIError(404,"Channel doesnt exist")
//     }

//     return res.
//     status(200)
//     .json(
//         new APIResponse(200,channel[0],"channel fetched successfully")
//     )
// })

const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const {username} = req.body;

    if(!username?.trim()){
        throw new APIError(400,"Please provide username")
    }

    const channel=await User.aggregate([
        {
            $match:{
                username:username
            }
        },{
            $lookup:{
                from:"Subscription",
                localField:"_id",
                foreignField:"channel",
                as:"suscribers"
            }
        },
            {
                $lookup:{
                    from:"Subscription",
                    localField:"_id",
                    foreignField:"suscriber",
                    as:"suscriberedTo"
            }
        },{
            $addFields:{
                suscribersCount:{
                    $size:"suscribers"
                },
                channelsSuscribeToCOunt:{
                    $size:"suscriberedTo"
                },
                isSuscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$suscribers.suscriber"]}, //is present or not as a scuscriber'
                        then:true,
                        else:false
                    }
                }
            }
        }   ,
        {
            $project:{  //to give selected element and flag on
                fullname:1,
                username:1,
                email:1,
                suscribersCount:1,
                channelsSuscribeToCOunt:1,
                avatar:1,
                coverImage:1
            }
        }
    ])

    if(!channel?.length){
        throw new APIError(400,"Channel doesnt exist")
    }

    return res.status(200)
    .json(
        new APIResponse(200,channel[0],"")
    )
})


const getWatchHistory=asyncHandler(async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },{
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },{
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new APIResponse(200,user[0].watchHistory,"watch history successfully")
    )
})


export {registerUser,loginUser,logoutUser,getWatchHistory,refreshAccessToken,updateAccountDetails,changeCurrentPassword,updateUserCoverImage,getUserChannelProfile,updateUserAvatar}
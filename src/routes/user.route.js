import { Router } from "express";
import { registerUser ,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,updateAccountDetails,getWatchHistory,getUserChannelProfile,updateUserAvatar,updateUserCoverImage} from "../contorllers/user.controller.js";
import {upload} from "../middleware/multer.js"
import { verifyJWT } from "../middleware/auth.middleware.js";

const router=Router();

router.route("/register").post(upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        
        name:"coverImage",
        maxCount:1
    }
]),registerUser)


router.route("/login").post(loginUser);

//secured routes
    router.route("/logout").post(verifyJWT,logoutUser)
    router.route("/refresh-token").post(refreshAccessToken)
    router.route("/change-password").post(verifyJWT,changeCurrentPassword)
    router.route("/current-user").post(verifyJWT,updateAccountDetails)
    router.route("/avatar").post(verifyJWT,upload.single("avatar"),updateUserAvatar)
    router.route("/coverImage").post(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
    router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
    router.route("/history").get(verifyJWT,getWatchHistory)

export default router
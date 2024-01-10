import { Router } from "express";
import { registerUser ,loginUser,logoutUser,refreshAccessToken} from "../contorllers/user.controller.js";
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

export default router
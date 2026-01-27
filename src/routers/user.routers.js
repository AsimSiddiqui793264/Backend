import { Router } from "express";
import {
    loginUser,
    registerUser,
    logoutUser,
    refreshAccessToken,
    changeUserPassword,
    getUserWatchHistory,
    getCurrentUser,
    updateUserProfile,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
} from "../controllers/user.controller.js";
import { upload } from "../middlwares/multer.middleware.js";
import { verifyJWT } from "../middlwares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeUserPassword);
router.route("/watch-history").get(verifyJWT, getUserWatchHistory);
router.route("/update-profile").patch(verifyJWT, updateUserProfile);
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/update-cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/channel/:username").get(getUserChannelProfile);

export default router;
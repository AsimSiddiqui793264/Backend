import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/Cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {

    const { fullName, email, password, userName } = req.body;

    if (
        [fullName, email, userName, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    };

    const existingUser = await User.findOne({
        $or: [{ email }, { userName }]
    });

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists");
    };

    const avatarLocalFile = req.files?.avatar[0]?.path;
    const coverImageLocalFile = req.files?.coverImage[0]?.path;

    if (!avatarLocalFile) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatarUploadResponse = await uploadOnCloudinary(avatarLocalFile);

    if (!avatarUploadResponse) {
        throw new ApiError(500, "Failed to upload avatar");
    };

    const coverImageUploadResponse = await uploadOnCloudinary(coverImageLocalFile);


    const user = await User.create({
        fullName,
        email,
        password,
        userName: userName.toLowerCase(),
        avatar: avatarUploadResponse.url,
        coverImage: coverImageUploadResponse?.url || ""
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, createdUser, "User registered Successfully"))
});

export { registerUser };

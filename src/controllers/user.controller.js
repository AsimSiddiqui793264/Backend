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
    // const coverImageLocalFile = req.files?.coverImage[0]?.path;

    let coverImageLocalFile;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalFile = req.files.coverImage[0].path;
    }
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

const generateAccessAndRefreshToken = async (userId) =>{

const user = await User.findById(userId);

const accessToken = user.generateAccessToken();
const refreshToken = user.generateRefreshToken();

user.refreshToken = refreshToken;
user.save({validateBeforeSave : false});

return {accessToken , refreshToken};

}

const loginUser = asyncHandler(async (req , res) =>{

const { email, password , userName } = req.body;

if (!userName || !email || !password) {
    throw new ApiError(400, "All fields are required");
}

const user = await User.findOne({
    $or: [{ email }, { userName }]
});

if (!user) {
    throw new ApiError(404, "User does not exist");
}

const isPasswordCorrect = await user.isPasswordValid(password);

if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid user credentials");
}

const { accessToken , refreshToken } = await generateAccessAndRefreshToken(user._id);

const loggedInUser = await User.findById(user._id)
.select("-password -refreshToken");

if(!loggedInUser){
    throw new ApiError(500 , "Something went wrong while logging in the user");
};

const options = {
    httpOnly : true,
    secure : true
};

return res
    .status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(
        new ApiResponse(
            200,
            { user, accessToken, refreshToken },
            "User logged in successfully"
        )
    );
});

const logoutUser = asyncHandler(async (req , res) =>{

await User.findByIdAndUpdate(
    req.user._id,
    {
        $set : {
            refreshToken : null
        }
    },
    {
        new : true
    }
);

const options = {
    httpOnly : true,
    secure : true
};

return res
.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json(
    new ApiResponse(200, {}, "User logged out successfully")
);

})
export { registerUser , loginUser , logoutUser};

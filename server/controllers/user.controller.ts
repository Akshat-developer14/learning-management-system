import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import userModel, { UserInterface } from "../models/user.model";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import { accessTokenOptions, refreshTokenOptions, sendToken } from "../utils/jwt";
import { redis } from "../utils/redis";
import { getAllUsersService, getUserById, updateUserRoleService } from "../services/user.service";
import cloudinary from "cloudinary";

// Register user
interface RegistrationInterface {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

export const registerUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;
        const isEmailExist = await userModel.findOne({ email });
        if (isEmailExist) {
            return next(new ErrorHandler("Email already exist", 400));
        }
        const user: RegistrationInterface = {
            name,
            email,
            password
        };
        const activationToken = createActivationToken(user);

        const activationCode = activationToken.activationCode;

        const data = { user: { name: user.name }, activationCode }
        await ejs.renderFile(path.join(__dirname, "../mails/activation-mail.ejs"), data)

        try {
            await sendMail({
                email: user.email,
                subject: "Activate your e-learning account",
                template: "activation-mail.ejs",
                data
            })
            res.status(201).json({
                success: true,
                message: `Please check your email: ${user.email} to activate your account`,
                activationToken: activationToken.token
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

interface ActivationTokenInterface {
    token: string;
    activationCode: string;
}

interface UserForTokenInterface {
    name: string;
    email: string;
    password: string;
}

export const createActivationToken = (user: UserForTokenInterface): ActivationTokenInterface => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jwt.sign({
        user: {
            name: user.name,  // Ensure name is included
            email: user.email,
            password: user.password
        },
        activationCode
    }, process.env.ACTIVATION_SECRET as Secret, {
        expiresIn: "5m",
    });
    return { token, activationCode };
};

interface ActivationRequestInterface {
    activation_token: string;
    activation_code: string;
}
export const activateUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { activation_token, activation_code } = req.body as ActivationRequestInterface;

        const newUser: { user: UserInterface; activationCode: string } = jwt.verify(
            activation_token,
            process.env.ACTIVATION_SECRET as string
        ) as { user: UserInterface; activationCode: string };

        if (newUser.activationCode !== activation_code) {
            return next(new ErrorHandler("Invalid activation code", 400))
        }

        const { name, email, password } = newUser.user;
        const existUser = await userModel.findOne({ email });
        if (existUser) {
            return next(new ErrorHandler("Email already exists", 400));
        }
        await userModel.create({
            name,
            email,
            password
        });
        res.status(201).json({
            success: true,
            message: "User created successfully",
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
});

//Login user
interface LoginRequestInterface {
    email: string;
    password: string;
}
export const loginUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body as LoginRequestInterface;
        if (!email || !password) {
            return next(new ErrorHandler("Please enter email and password", 400))
        }
        const user = await userModel.findOne({ email }).select("+password");
        if (!user) {
            return next(new ErrorHandler("Invalid email or password", 400))
        }
        const isPasswordMatch = await user.comparePassword(password)
        if (!isPasswordMatch) {
            return next(new ErrorHandler("Invalid email or password", 400))
        }
        sendToken(user, 200, res);

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

//logout user
export const logoutUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.cookie("access_token", "", { maxAge: 1 });
        res.cookie("refresh_token", "", { maxAge: 1 });
        if(!req.user){
            return next(new ErrorHandler("User not found", 400))
        }
        const userId = req.user?._id.toString();
        redis.del(userId);
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

//update access token
export const updateAccessToken = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refresh_token = req.cookies.refresh_token as string;
        const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN as string) as JwtPayload;
        const message = "Could not refresh token";

        if (!decoded) {
            return next(new ErrorHandler(message, 400))
        }
        const session = await redis.get(decoded.id as string);

        if (!session) {
            return next(new ErrorHandler("Please login again to access this resource", 400))
        }
        const user = JSON.parse(session);
        const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN as string, {
            expiresIn: "5m"
        });
        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN as string, {
            expiresIn: "3d"
        });

        req.user = user;

        res.cookie("access_token", accessToken, accessTokenOptions);
        res.cookie("refresh_token", refreshToken, refreshTokenOptions);

        await redis.set(user._id, JSON.stringify(user), "EX", 604800 );//604800 in seconds --7 days


        res.status(200).json({
            status: "success",
            accessToken
        });


    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

// get user Info
export const getUserInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        if(!req.user){
            return next(new ErrorHandler("User not found", 400))
        }
        const userId: string = req.user?._id.toString();
        await getUserById(userId, res);
    } catch (error) {
        return next(new ErrorHandler("Error", 400))
    }
})

interface SocialAuthInterface {
    email: string;
    name: string;
    avatar: string;
}
// social auth
export const socialAuth = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, name, avatar } = req.body as SocialAuthInterface;
        const user = await userModel.findOne({ email });
        if (!user) {
            const newUser = await userModel.create({ email, name, avatar });
            sendToken(newUser, 200, res);
        } else {
            sendToken(user, 200, res);
        }
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})
//update user info
interface UpdateUserInfoInterface {
    name?: string;
    email?: string;
}
export const updateUserInfo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email } = req.body as UpdateUserInfoInterface;
        const userId = req.user?._id.toString();
        const user = await userModel.findById(userId);

        if (email && user) {
            const isEmailExist = await userModel.findOne({ email });
            if (isEmailExist) {
                return next(new ErrorHandler("Email already exist", 400))
            }
            user.email = email;
        }
        if (name && user) {
            user.name = name;
        }
        await user?.save();

        await redis.set(userId as string, JSON.stringify(user));

        res.status(201).json({
            success: true,
            user
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

// update user password
interface UpdatePasswordInterface {
    oldPassword: string;
    newPassword: string;
}
export const updatePassword = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { oldPassword, newPassword } = req.body as UpdatePasswordInterface;

        if (!oldPassword || !newPassword) {
            return next(new ErrorHandler("Please enter old and new password", 400))
        }

        const user = await userModel.findById(req.user?._id).select("+password");

        if (user?.password === undefined) {
            return next(new ErrorHandler("Invalid user", 400))
        }

        const isPasswordMatch = await user?.comparePassword(oldPassword);

        if (!isPasswordMatch) {
            return next(new ErrorHandler("Invalid old password", 400))
        }

        user.password = newPassword;

        await user.save();

        const userId = req.user?._id.toString();

        await redis.set(userId as string, JSON.stringify(user));

        res.json({
            success: true,
            user
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

// update profile picture
interface UpdateAvatarInterface {
    avatar: string;
}
export const updateProfilePicture = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { avatar } = req.body as UpdateAvatarInterface;

        const userId = req.user?._id.toString();

        const user = await userModel.findById(userId);

        if (avatar && user) {
            // if only we have avatar and user

            if (user?.avatar?.public_id) {
                // first delete the old image
                await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);

                const myCloud = await cloudinary.v2.uploader.upload(avatar, {
                    folder: "avatars",
                    width: 150,
                    crop: "scale"
                });
                user.avatar = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url
                }
            } else {
                const myCloud = await cloudinary.v2.uploader.upload(avatar, {
                    folder: "avatars",
                    width: 150,
                    crop: "scale"
                });
                user.avatar = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url
                }
            }

            await user.save();

            await redis.set(userId as string, JSON.stringify(user));


            res.status(200).json({
                success: true,
                user
            });
        }
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

// get all users --only for admin
export const getAllUsers = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await getAllUsersService(res);
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400))
        }
    })

// update user role --only for admin
export const updateUserRole = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, role } = req.body;
        await updateUserRoleService(res, id, role);
    } catch(error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

// Delete user --only for admin
export const deleteUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const user = await userModel.findById(id);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }
        await user.deleteOne({ id });

        await redis.del(id);

        res.status(201).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch(error: any){
        return next(new ErrorHandler(error.message, 400))
    }
})
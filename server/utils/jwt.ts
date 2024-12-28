import dotenv from "dotenv";
import { UserInterface } from "../models/user.model";
import { Response } from "express";
import { redis } from "./redis";

dotenv.config();

interface TokenOptionsInterface {
    expires: Date;
    maxAge: number;
    httpOnly: boolean;
    sameSite: "lax" | "strict" | "none" | undefined;
    secure?: boolean;
}

//parse environment variables to integrate with fallback values
const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE ?? "300", 10);
const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE ?? "1200", 10);

//options for cookies 
export const accessTokenOptions: TokenOptionsInterface = {
    expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
    maxAge: accessTokenExpire * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax"
};
export const refreshTokenOptions: TokenOptionsInterface = {
    expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
    maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax"
};

export const sendToken = (user: UserInterface, statusCode: number, res: Response) => {
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();

    // Assert the type of user._id as a string 
    const userId = user._id as string;

    //upload session to redis 
    redis.set(userId, JSON.stringify(user) as any);

    // only set secure to true in production
    if (process.env.NODE_ENV === "production") {
        accessTokenOptions.secure = true;
    }
    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);

    res.status(statusCode).json({
        success: true,
        user,
        accessToken
    });

}
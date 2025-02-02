import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";

// authenticated user
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {

    const access_token = req.cookies?.access_token;
    if (!access_token) {
        return next(new ErrorHandler("Please login to access this resource", 400));
    }
    try {
        const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN as string) as JwtPayload;
        const userId = decoded?.id;

        if (!userId) {
            return next(new ErrorHandler("Access token is not valid", 400));
        }
        const user = await redis.get(userId);
        if (!user) {
            return next(new ErrorHandler("Please login to access this resource", 400));
        }
        req.user = JSON.parse(user);
        next();
    } catch (error) {
        return next(new ErrorHandler("Access token expired", 400));
    }
};

// validate user role
export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user?.role || "")) {
            return next(new ErrorHandler(`Role: ${req.user?.role} is not allowed to access this resource`, 403));
        }
        next();
    }
};

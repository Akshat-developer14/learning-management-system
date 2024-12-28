import { Response } from "express";
import { redis } from "../utils/redis";

// Get user by ID
export const getUserById = async (id: string, res: Response) => {
    try {
        const userJson = await redis.get(id);
        if(userJson){
            const user = JSON.parse(userJson);
            res.status(200).json({
                success: true,
                user
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

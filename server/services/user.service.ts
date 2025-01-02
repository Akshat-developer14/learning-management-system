import { Response } from "express";
import { redis } from "../utils/redis";
import userModel from "../models/user.model";

// Get user by ID
export const getUserById = async (id: string, res: Response) => {
    try {
        const userJson = await redis.get(id);
        if (userJson) {
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

// get all users
export const getAllUsersService = async (res: Response) => {
    const users = await userModel.find().sort({ createdAt: -1 })

    res.status(201).json({
        success: true,
        users
    });
};
// changing user roles --only for admin
export const updateUserRoleService = async(res: Response, id: string, role: string) => {
    const user = await userModel.findByIdAndUpdate(id, { role }, { new: true });
    res.status(201).json({
        success: true,
        user
    });
}
import express from 'express';
import { activateUser, getUserInfo, loginUser, logoutUser, registerUser, socialAuth, updateAccessToken, updatePassword, updateProfilePicture, updateUserInfo } from '../controllers/user.controller';
import { isAuthenticated } from '../middlewares/auth';
const userRouter = express.Router();

userRouter.post("/register", registerUser);

userRouter.post("/activate-user", activateUser);

userRouter.post("/login", loginUser);

userRouter.get("/logout", isAuthenticated, logoutUser);

userRouter.get("/refresh", updateAccessToken)

userRouter.get("/me", isAuthenticated, getUserInfo)

userRouter.post("/social-auth", socialAuth)

userRouter.put("/update-user-info", isAuthenticated, updateUserInfo)

userRouter.put("/update-user-password", isAuthenticated, updatePassword)

userRouter.put("/update-user-profile-picture", isAuthenticated, updateProfilePicture)

export default userRouter;
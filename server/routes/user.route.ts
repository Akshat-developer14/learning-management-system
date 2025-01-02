import express from 'express';
import { activateUser, getAllUsers, getUserInfo, loginUser, logoutUser, registerUser, socialAuth, updateAccessToken, updatePassword, updateProfilePicture, updateUserInfo, updateUserRole } from '../controllers/user.controller';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
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

userRouter.get("/get-all-users", isAuthenticated, authorizeRoles("admin"), getAllUsers)

userRouter.put("/update-user-role", isAuthenticated, authorizeRoles("admin"), updateUserRole)

export default userRouter;

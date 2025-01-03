import express from "express";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth";
import { createLayout, editlayout, getLayoutByType } from "../controllers/layout.controller";
const layoutRouter = express.Router();

layoutRouter.post("/create-layout", isAuthenticated, authorizeRoles("admin"), createLayout);

layoutRouter.put("/edit-layout", isAuthenticated, authorizeRoles("admin"), editlayout);

layoutRouter.get("/get-layout-by-type", getLayoutByType);

export default layoutRouter;

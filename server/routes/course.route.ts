import express from 'express';
import { editCourse, getAllCourse, getSingleCourse, uploadCourse } from '../controllers/course.controller';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
const courseRouter = express.Router();

courseRouter.post("/create-course", isAuthenticated, authorizeRoles("admin"), uploadCourse);

courseRouter.put("/update-course/:id", isAuthenticated, authorizeRoles("admin"), editCourse);

courseRouter.get("/get-course/:id", getSingleCourse);

courseRouter.get("/all-courses/", getAllCourse);

export default courseRouter;
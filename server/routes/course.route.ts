import express from 'express';
import { addAnswer, addQuestion, AddReplyToReview, AddReview, editCourse, getAllCourse, getAllCourses, getCourseForValidUser, getSingleCourse, uploadCourse } from '../controllers/course.controller';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
const courseRouter = express.Router();

courseRouter.post("/create-course", isAuthenticated, authorizeRoles("admin"), uploadCourse);

courseRouter.put("/update-course/:id", isAuthenticated, authorizeRoles("admin"), editCourse);

courseRouter.get("/get-course/:id", getSingleCourse);

courseRouter.get("/all-courses/", getAllCourse);

courseRouter.get("/get-course-content/:id", isAuthenticated, getCourseForValidUser);

courseRouter.put("/add-question", isAuthenticated, addQuestion);

courseRouter.put("/add-answer", isAuthenticated, addAnswer);

courseRouter.put("/add-review/:id", isAuthenticated, AddReview);

courseRouter.put("/add-reply-to-review", isAuthenticated, authorizeRoles("admin"), AddReplyToReview);

courseRouter.get("/get-all-courses", isAuthenticated, authorizeRoles("admin"), getAllCourses);

export default courseRouter;

import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { createCourse, getAllCoursesService } from "../services/course.service";
import CourseModel from "../models/course.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notification.model";


// upload course
export const uploadCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses"
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }
        createCourse(data, res, next)
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

//edit course
export const editCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            await cloudinary.v2.uploader.destroy(thumbnail.public_id);

            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses"
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }
        }
        const { id } = req.params;
        const course = await CourseModel.findByIdAndUpdate(id, { $set: data }, {
            new: true
        });
        if (!course) { return next(new ErrorHandler("Course not found", 404)); }
        res.status(200).json({
            success: true,
            course
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

// get single course --without purchase
export const getSingleCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseId = req.params.id;

        const isCacheExist = await redis.get(courseId);

        if (isCacheExist) {
            const course = JSON.parse(isCacheExist);
            res.status(200).json({
                success: true,
                course
            });
        } else {
            const course = await CourseModel.findById(courseId).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");

            await redis.set(courseId, JSON.stringify(course), "EX", 604800 );//604800 in seconds --7 days 

            res.status(200).json({
                success: true,
                course
            });
        }
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
})

// get all course --without purchase
export const getAllCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const isCacheExist = await redis.get("allCourses");

        if (isCacheExist) {
            const courses = JSON.parse(isCacheExist);

            res.status(200).json({
                success: true,
                courses
            });
        } else {
            const courses = await CourseModel.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");

            await redis.set("allCourses", JSON.stringify(courses));

            res.status(200).json({
                success: true,
                courses
            });
        }
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
})

// get course content --only for valid user
export const getCourseForValidUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;
        const courseExists = userCourseList?.find((course: any) => course._id.toString() === courseId);

        if (!courseExists) {
            return next(new ErrorHandler("You are not eligible to access this course", 404));
        }

        const course = await CourseModel.findById(courseId)

        const courseContent = course?.courseData;

        res.status(200).json({
            success: true,
            courseContent
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
})
// add question in course
interface AddQuestionInterface {
    question: string;
    courseId: string;
    contentId: string;
}
export const addQuestion = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { question, courseId, contentId }: AddQuestionInterface = req.body;
        const course = await CourseModel.findById(courseId);

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("Invalid content id", 400));
        }
        const courseContent = course?.courseData?.find((item: any) => item._id.equals(contentId));

        if (!courseContent) {
            return next(new ErrorHandler("Invalid content id", 400));
        }

        // create a new question
        const newQuestion: any = {
            user: req.user,
            question,
            questionReplies: []
        }
        // add this question to our course content
        courseContent.questions.push(newQuestion);

        await NotificationModel.create({
            user: req.user?._id,
            title: "New Question Received",
            message: `You have a new question in ${courseContent.title}`
        })

        await course?.save();

        res.status(200).json({
            success: true,
            course
        });


    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
})

//add answer in question
interface AddAnswerInterface {
    answer: string;
    courseId: string;
    contentId: string;
    questionId: string;
}
export const addAnswer = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { answer, courseId, contentId, questionId }: AddAnswerInterface = req.body;
        const course = await CourseModel.findById(courseId);

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("Invalid content id", 400));
        }
        const courseContent = course?.courseData?.find((item: any) => item._id.equals(contentId));

        if (!courseContent) {
            return next(new ErrorHandler("Invalid content id", 400));
        }

        const question = courseContent.questions.find((item: any) => item._id.equals(questionId));

        if (!question) {
            return next(new ErrorHandler("Invalid question id", 400));
        }


        // create a new anwser object
        const newAnswer: any = {
            user: req.user,
            answer
        }
        // add this question to our course content
        question.questionReplies?.push(newAnswer);

        await course?.save();

        if (req.user?._id === question.user._id) {
            // create a notification
            await NotificationModel.create({
                user: req.user?._id,
                title: "New Question Reply Received",
                message: `You have a new question reply in ${courseContent.title}`
            })

        } else {
            const data = {
                name: question.user.name,
                title: courseContent.title,
            }
            await ejs.renderFile(path.join(__dirname, "../mails/question-reply.ejs"), data)

            try {
                await sendMail({
                    email: question.user.email,
                    subject: "Question Reply",
                    template: "question-reply.ejs",
                    data
                })
            } catch (error: any) {
                return next(new ErrorHandler(error.message, 500))
            }
        }

        res.status(200).json({
            success: true,
            course
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500))
    }
})

//Add review in course
interface AddReviewInterface {
    review: string;
    courseId: string;
    rating: number;
    userId: string;
}
export const AddReview = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;

        const courseExists = userCourseList?.some((course: any) => course._id.toString() === courseId);

        if (!courseExists) {
            return next(new ErrorHandler("You are not eligible to access this course", 404));
        }
        const course = await CourseModel.findById(courseId);

        const { review, rating } = req.body as AddReviewInterface;

        const reviewData: any = {
            user: req.user,
            rating,
            comment: review
        }

        course?.reviews.push(reviewData);

        let avg = 0;

        course?.reviews.forEach((rev: any) => {
            avg += rev.rating;
        })

        if (course) {
            course.ratings = avg / course.reviews.length;
        }

        await course?.save();

        const notification = {
            title: "New Review Received",
            message: `${req.user?.name} has given a review in ${course?.name}`
        }

        // create notification

        res.status(200).json({
            success: true,
            course
        });


    } catch (error: any) {
        return new ErrorHandler(error.message, 500)
    }
})

// add reply in review
interface AddReplyInterface {
    comment: string;
    courseId: string;
    reviewId: string;
}
export const AddReplyToReview = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { comment, courseId, reviewId } = req.body as AddReplyInterface;

        const course = await CourseModel.findById(courseId);

        if (!course) {
            return next(new ErrorHandler("Course not found", 404));
        }
        const review = course?.reviews.find((rev: any) => rev._id.toString() === reviewId);

        if (!review) {
            return next(new ErrorHandler("Review not found", 404));
        }

        const replyData: any = {
            user: req.user,
            comment
        }
        if (!review.commentReplies) {
            review.commentReplies = [];
        }
        review.commentReplies?.push(replyData);
        await course?.save();

        res.status(200).json({
            success: true,
            course
        });

    } catch (error: any) {
        return new ErrorHandler(error.message, 500)
    }
})
// get all courses --only for admin
export const getAllCourses = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await getAllCoursesService(res);
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400))
        }
    })
// Delete course --only for admin
export const deleteCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const course = await CourseModel.findById(id);
        if (!course) {
            return next(new ErrorHandler("Course not found", 404));
        }
        await course.deleteOne({ id });

        await redis.del(id);

        res.status(201).json({
            success: true,
            message: "Course deleted successfully"
        });
    } catch(error: any){
        return next(new ErrorHandler(error.message, 400))
    }
})

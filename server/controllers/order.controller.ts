import { Request, Response, NextFunction } from 'express'
import { CatchAsyncError } from '../middlewares/catchAsyncErrors'
import ErrorHandler from '../utils/ErrorHandler'
import { OrderInterface } from '../models/order.model'
import userModel, { UserInterface } from '../models/user.model'
import CourseModel from '../models/course.model'
import path from 'path'
import ejs from 'ejs'
import NotificationModel from '../models/notification.model'
import sendMail from '../utils/sendMail'
import { newOrder } from '../services/order.service'


//create order
export const createOrder = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId, payment_info } = req.body as OrderInterface;

        const user: UserInterface | null = await userModel.findById(req.user?._id);

        if(!user) {
            return next(new ErrorHandler("User not found", 400))
        }

        const userId = user._id;


        const courseExistInUser = user?.courses.some((course: any) => course._id.toString() === courseId);

        if (courseExistInUser) {
            return next(new ErrorHandler("You have already purchased this course", 400))
        }

        const course = await CourseModel.findById(courseId);

        if (!course) {
            return next(new ErrorHandler("Course not found", 400))
        }

        const data: any = {
            courseId: course._id,
            userId: user?._id,
            payment_info    
        }

        const courseID: any = course._id;

        const mailData = {
            order: {
                _id: courseID.toString().slice(0, 6),
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                })
            }
        }
        await ejs.renderFile(path.join(__dirname, "../mails/order-confirmation.ejs"), { order: mailData })

        try {
            if (user) {
                await sendMail({
                    email: user.email,
                    subject: "Order Confirmation",
                    template: "order-confirmation.ejs",
                    data: mailData
                });
            }
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400))
        }


        user?.courses.push(courseID);

        await user?.save();

        await NotificationModel.create({
            user: userId,
            title: "New Order",
            message: `You have a new order from ${course.name}`
        })

        if(course.purchased){
        course.purchased += 1
        }

        await course.save();

        newOrder(data, res, next);
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

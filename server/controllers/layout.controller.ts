import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import LayoutModel from "../models/layout.model";
import cloudinary from "cloudinary";



// create layout 
export const createLayout = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body;

        const isTypeExist = await LayoutModel.findOne({ type });

        if (isTypeExist) {
            return next(new ErrorHandler(`${type} already exists`, 400))
        }

        if (type === "Banner") {
            const { image, title, subTitle } = req.body;

            const myCloud = await cloudinary.v2.uploader.upload(image, {
                folder: "layout"
            });
            const banner = {
                type: "Banner",
                image: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url
                },
                title,
                subTitle
            }

            await LayoutModel.create(banner)
        }
        if (type === "FAQ") {
            const { faq } = req.body;
            const faqItems = await Promise.all(
                faq.map(async (item: any) => {
                    return {
                        question: item.question,
                        answer: item.answer
                    }
                })
            )
            await LayoutModel.create({ type: "FAQ", faq: faqItems })
        }
        if (type === "category") {
            const { category } = req.body;
            const categoryItems = await Promise.all(
                category.map(async (item: any) => {
                    return {
                        title: item.title
                    }
                })
            )
            await LayoutModel.create({ type: "category", category: categoryItems })
        }
        res.status(201).json({
            success: true,
            message: "Layout created successfully"
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

// edit layout 
export const editlayout = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body;

        const isTypeExist = await LayoutModel.findOne({ type });

        if (!isTypeExist) {
            return next(new ErrorHandler(`${type} does not exists`, 400))
        }

        if (type === "Banner") {
            const bannerData = await LayoutModel.findOne({ type: "Banner" });
            if (bannerData) {
                await cloudinary.v2.uploader.destroy(bannerData.banner.image.public_id);
            }
            const { image, title, subTitle } = req.body;

            const myCloud = await cloudinary.v2.uploader.upload(image, {
                folder: "layout"
            });
            const banner = {
                type: "Banner",
                image: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url
                },
                title,
                subTitle
            }

            await LayoutModel.findByIdAndUpdate(bannerData?.id, { banner })
        }
        if (type === "FAQ") {
            const { faq } = req.body;

            const FaqItem = await LayoutModel.findOne({ type: "FAQ" });

            const faqItems = await Promise.all(
                faq.map(async (item: any) => {
                    return {
                        question: item.question,
                        answer: item.answer
                    }
                })
            )
            await LayoutModel.findByIdAndUpdate(FaqItem?._id, { type: "FAQ", faq: faqItems })
        }
        if (type === "category") {
            const { category } = req.body;

            const categoryData = await LayoutModel.findOne({ type: "category" });

            const categoryItems = await Promise.all(
                category.map(async (item: any) => {
                    return {
                        title: item.title
                    }
                })
            )
            await LayoutModel.findByIdAndUpdate(categoryData?._id, { type: "category", category: categoryItems })
        }
        res.status(201).json({
            success: true,
            message: "Layout updated successfully"
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

// get layout for frontend by type

export const getLayoutByType = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const layout = await LayoutModel.findOne({ type: req.body.type });

        if(!req.body.type){
            return next(new ErrorHandler("Layout type is required", 400))
        }
        res.status(200).json({
            success: true,
            layout
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})